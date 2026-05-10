'use server';

import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth/getUser';

export type SubmitAnswerInput = {
  code: string;
  questionId: string;
  /** Classic: option index (0-3). Decryptor: typed string. */
  answer: number | string;
};

export type SubmitAnswerResult = { ok: true } | { ok: false; error: string };

/**
 * Player locks in their answer for the current question. UNIQUE on
 * (player_id, question_id) prevents double-submission.
 */
export async function submitAnswer(input: SubmitAnswerInput): Promise<SubmitAnswerResult> {
  try {
    const user = await getUser();
    if (!user) return { ok: false, error: 'not signed in' };

    const supabase = await createClient();

    const { data: rooms } = await supabase.rpc('find_room_by_code', {
      p_code: input.code.toUpperCase(),
    });
    const room = rooms?.[0];
    if (!room) return { ok: false, error: 'room not found' };
    if (room.phase !== 'question' && room.phase !== 'final_question') {
      return { ok: false, error: 'not accepting answers' };
    }

    const { data: player } = await supabase
      .from('players')
      .select('id')
      .eq('room_id', room.id)
      .eq('user_id', user.id)
      .maybeSingle();
    if (!player) return { ok: false, error: 'you are not a player in this room' };

    const { error } = await supabase.from('answers').insert({
      room_id: room.id,
      player_id: player.id,
      question_id: input.questionId,
      answer: input.answer,
    });

    if (error) {
      if (error.code === '23505') {
        return { ok: false, error: 'already locked in for this question' };
      }
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'unknown error' };
  }
}
