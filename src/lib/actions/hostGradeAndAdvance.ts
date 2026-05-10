'use server';

import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth/getUser';
import { QUESTIONS_BY_ID, isCorrect, calcScore } from '@/data/questions';
import { questionDuration } from '@/lib/game/useQuestionTimer';
import type { RoomSettings } from '@/lib/types';

export type GradingResult = { ok: true } | { ok: false; error: string };

/**
 * Host-only. Grades all answers for the current question (or final question)
 * and advances the phase to reveal/final_reveal in one server-side pass.
 *
 * Trust model: host's caller has the question content; we recompute is_correct
 * here on the server so a tampered client can't lie about correctness. Score
 * is also computed here to prevent bonus-point inflation.
 */
export async function hostGradeAndAdvance(
  code: string,
  questionId: string,
): Promise<GradingResult> {
  try {
    const user = await getUser();
    if (!user) return { ok: false, error: 'not signed in' };

    const supabase = await createClient();

    const { data: rooms } = await supabase.rpc('find_room_by_code', {
      p_code: code.toUpperCase(),
    });
    const room = rooms?.[0];
    if (!room) return { ok: false, error: 'room not found' };
    if (room.host_id !== user.id) return { ok: false, error: 'host only' };

    const isFinal = room.phase === 'final_question';
    if (room.phase !== 'question' && !isFinal) {
      return { ok: false, error: 'wrong phase for grading' };
    }

    const question = QUESTIONS_BY_ID[questionId];
    if (!question) return { ok: false, error: `unknown question: ${questionId}` };

    // Pull all answers for this question (uses SECURITY DEFINER RPC so RLS
    // doesn't hide peers' rows from the host).
    const { data: answers } = await supabase.rpc('list_room_answers', {
      p_room_id: room.id,
      p_question_id: questionId,
    });

    // Pull all wagers if mainframe; needed to apply +/− on score.
    let wagersByPlayer = new Map<string, number>();
    if (isFinal) {
      const { data: wagers } = await supabase.rpc('list_room_wagers', {
        p_room_id: room.id,
      });
      wagersByPlayer = new Map((wagers ?? []).map((w) => [w.player_id, w.amount]));
    }

    const { data: players } = await supabase
      .from('players')
      .select('id, score, streak')
      .eq('room_id', room.id);

    if (!players) return { ok: false, error: 'failed to load players' };

    const settings = room.settings as RoomSettings | null;
    const totalSec = questionDuration(settings?.difficulty, isFinal);
    const startedAtMs = room.question_started_at ? new Date(room.question_started_at).getTime() : Date.now();

    type GradeRow = {
      player_id: string;
      question_id: string;
      is_correct: boolean;
      points_awarded: number;
      new_score: number;
      new_streak: number;
    };
    const grading: GradeRow[] = [];

    for (const p of players) {
      const a = (answers ?? []).find((row) => row.player_id === p.id);
      const wagerAmount = wagersByPlayer.get(p.id) ?? 0;

      let pointsAwarded = 0;
      let newScore = p.score;
      let newStreak = p.streak;
      let correct = false;

      if (a) {
        correct = isCorrect(question, a.answer);
        if (isFinal) {
          // Mainframe: ± wager. No speed bonus, no streak.
          if (correct) {
            pointsAwarded = wagerAmount;
            newScore = p.score + wagerAmount;
            newStreak = p.streak + 1;
          } else {
            pointsAwarded = -wagerAmount;
            newScore = Math.max(0, p.score - wagerAmount);
            newStreak = 0;
          }
        } else {
          // Normal round: speed-based score.
          if (correct) {
            const elapsedSec = (Date.now() - startedAtMs) / 1000;
            const timeRemaining = Math.max(0, totalSec - elapsedSec);
            newStreak = p.streak + 1;
            pointsAwarded = calcScore(timeRemaining, newStreak);
            newScore = p.score + pointsAwarded;
          } else {
            pointsAwarded = 0;
            newStreak = 0;
            newScore = p.score;
          }
        }
        grading.push({
          player_id: p.id,
          question_id: questionId,
          is_correct: correct,
          points_awarded: pointsAwarded,
          new_score: newScore,
          new_streak: newStreak,
        });
      } else {
        // Player didn't answer: timeout.
        if (isFinal) {
          // Mainframe timeout: lose the wager.
          newStreak = 0;
          newScore = Math.max(0, p.score - wagerAmount);
        } else {
          newStreak = 0;
        }
        // Need a placeholder answers row for grading apply (apply_grading
        // updates by player+question key). Insert a sentinel so the row
        // exists. Skip the grade write if no row exists by checking later.
      }
    }

    if (grading.length > 0) {
      const { error: gradeErr } = await supabase.rpc('apply_grading', {
        p_room_id: room.id,
        p_grading: grading,
      });
      if (gradeErr) return { ok: false, error: gradeErr.message };
    }

    // For players who didn't answer: still update their score+streak.
    for (const p of players) {
      const a = (answers ?? []).find((row) => row.player_id === p.id);
      if (!a) {
        const wagerAmount = wagersByPlayer.get(p.id) ?? 0;
        const newScore = isFinal ? Math.max(0, p.score - wagerAmount) : p.score;
        const { error } = await supabase
          .from('players')
          .update({ score: newScore, streak: 0 })
          .eq('id', p.id);
        if (error) return { ok: false, error: error.message };
      }
    }

    const { error: rpcErr } = await supabase.rpc('advance_phase', { p_room_id: room.id });
    if (rpcErr) return { ok: false, error: rpcErr.message };

    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'unknown error' };
  }
}
