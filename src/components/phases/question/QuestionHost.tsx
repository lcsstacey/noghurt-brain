'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Flame } from 'lucide-react';
import { C } from '@/styles/palette';
import { PlayerAvatar } from '@/components/shared/PlayerAvatar';
import { TimerBar } from '@/components/shared/TimerBar';
import { CATEGORIES } from '@/lib/game/categories';
import { QUESTIONS_BY_ID } from '@/data/questions';
import { useRoomChannel } from '@/lib/realtime/useRoomChannel';
import { useQuestionTimer, questionDuration, PHASE_ADVANCE_MS } from '@/lib/game/useQuestionTimer';
import type { RoomSettings } from '@/lib/types';
import { hostGradeAndAdvance } from '@/lib/actions/hostGradeAndAdvance';
import { submitAnswer } from '@/lib/actions/submitAnswer';
import { toPlayer } from '@/lib/game/colorIcon';
import { ClassicHostBody } from './ClassicHostBody';
import { DecryptorHostBody } from './DecryptorHostBody';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/database.types';

type PlayerRow = Database['public']['Tables']['players']['Row'];

type QuestionHostProps = {
  code: string;
  isHost: boolean;
  /** The current viewer's player row — used for lock-in + identity badge. */
  me: PlayerRow;
  questionId: string;
  roundIndex: number;
  totalRounds: number;
  startedAt: string | null;
  final?: boolean;
};

/**
 * Desktop "TV" question screen — same UI for hosts and guests. Both tap
 * the four cards (Classic) or type into the input (Decryptor) to lock in.
 * Host privileges (advancing phase, kick mode, etc.) live in the floating
 * <HostAdminBar />. The "(HOST)" badge top-right is purely a label.
 */
export function QuestionHost({
  code,
  isHost,
  me,
  questionId,
  roundIndex,
  totalRounds,
  startedAt,
  final = false,
}: QuestionHostProps) {
  const router = useRouter();
  const advanced = useRef(false);
  const { players, room } = useRoomChannel(code);
  const [myAnswer, setMyAnswer] = useState<number | string | null>(null);
  const [lockError, setLockError] = useState<string | null>(null);

  const difficulty = (room?.settings as RoomSettings | undefined)?.difficulty;
  const totalSec = questionDuration(difficulty, final);
  const { secondsLeft, isExpired } = useQuestionTimer(startedAt, totalSec);

  // Lock count via realtime answers query — host fetches via RPC for visibility.
  const supabase = useRef(createClient());
  const lockedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!startedAt) return;
    const sb = supabase.current;
    let cancelled = false;
    let channel: ReturnType<typeof sb.channel> | null = null;

    async function fetchAnswers(roomId: string) {
      const { data } = await sb.rpc('list_room_answers', {
        p_room_id: roomId,
        p_question_id: questionId,
      });
      if (cancelled) return;
      lockedRef.current = new Set((data ?? []).map((a) => a.player_id));
    }

    (async () => {
      const { data: rooms } = await sb.rpc('find_room_by_code', {
        p_code: code.toUpperCase(),
      });
      const room = rooms?.[0];
      if (!room) return;
      await fetchAnswers(room.id);
      channel = sb
        .channel(`answers:${room.id}:${questionId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'answers', filter: `room_id=eq.${room.id}` },
          () => void fetchAnswers(room.id),
        )
        .subscribe();
    })();

    return () => {
      cancelled = true;
      if (channel) sb.removeChannel(channel);
    };
  }, [code, questionId, startedAt]);

  // Host auto-advance: timer expires OR all players locked.
  useEffect(() => {
    if (!isHost || advanced.current) return;
    const allLocked = players.length > 0 && players.every((p) => lockedRef.current.has(p.id));
    if (!isExpired && !allLocked) return;

    const id = setTimeout(async () => {
      if (advanced.current) return;
      advanced.current = true;
      const result = await hostGradeAndAdvance(code, questionId);
      if (result.ok) router.refresh();
    }, PHASE_ADVANCE_MS.questionGrace);

    return () => clearTimeout(id);
  }, [isExpired, players, isHost, code, questionId, router]);

  // Detect existing answer for this player (e.g. on reload).
  useEffect(() => {
    let cancelled = false;
    supabase.current
      .from('answers')
      .select('answer')
      .eq('player_id', me.id)
      .eq('question_id', questionId)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled && data) {
          const a = data.answer as number | string;
          setMyAnswer(a);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [me.id, questionId]);

  const handleLock = async (answer: number | string) => {
    setLockError(null);
    // Optimistic — feels instant, server rejection rolls back.
    setMyAnswer(answer);
    const result = await submitAnswer({ code, questionId, answer });
    if (!result.ok) {
      setLockError(result.error);
      setMyAnswer(null);
    }
  };

  const question = QUESTIONS_BY_ID[questionId];
  if (!question) return null;
  const cat = CATEGORIES[question.cat];
  const Icon = cat.Icon;
  const lockedCount = players.filter((p) => lockedRef.current.has(p.id)).length;
  const timerColor =
    secondsLeft < totalSec * 0.25 ? C.red : secondsLeft < totalSec * 0.5 ? C.yellow : C.green;
  const meColor = C[toPlayer(me).color];

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Icon size={20} style={{ color: cat.color }} />
          <div className="font-pixel text-xs" style={{ color: cat.color }}>
            {cat.name}
          </div>
          {final && (
            <div className="font-pixel text-xs px-2 py-1 mainframe-bg text-black">★ MAINFRAME ★</div>
          )}
        </div>
        <div className="flex flex-col items-end gap-0.5 leading-none">
          <div className="font-pixel text-sm text-glow-soft" style={{ color: meColor }}>
            {me.name}
          </div>
          {isHost && (
            <div className="font-pixel text-[9px]" style={{ color: C.purple }}>
              (HOST)
            </div>
          )}
          <div className="font-pixel text-xs text-zinc-400 mt-1">
            ROUND <span style={{ color: C.cyan }}>{roundIndex + 1}</span>
            <span className="text-zinc-700 mx-1">/</span>
            {totalRounds}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="font-pixel text-3xl tabular-nums" style={{ color: timerColor }}>
          {Math.ceil(secondsLeft).toString().padStart(2, '0')}
        </div>
        <div className="flex-1">
          <TimerBar time={secondsLeft} total={totalSec} ominous />
        </div>
        {final && <Flame size={20} style={{ color: C.purple }} className="warning-pulse" />}
      </div>

      <div className="flex-1 grid place-items-center py-2">
        <div className="font-pixel text-lg sm:text-2xl leading-relaxed text-center max-w-3xl text-white text-glow-soft">
          {question.prompt}
        </div>
      </div>

      <div>
        {question.type === 'classic' && (
          <ClassicHostBody
            q={question}
            onLock={handleLock}
            myAnswer={typeof myAnswer === 'number' ? myAnswer : null}
            disabled={isExpired}
          />
        )}
        {question.type === 'decryptor' && (
          <DecryptorHostBody
            q={question}
            secondsLeft={secondsLeft}
            totalSec={totalSec}
            onLock={handleLock}
            myAnswer={typeof myAnswer === 'string' ? myAnswer : null}
            disabled={isExpired}
          />
        )}
        {lockError && (
          <div className="font-pixel text-xs text-center mt-2" style={{ color: C.red }}>
            ✗ {lockError}
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-3">
          {players.map((p) => (
            <PlayerAvatar
              key={p.id}
              player={toPlayer(p)}
              size={48}
              locked={lockedRef.current.has(p.id)}
              dim={!lockedRef.current.has(p.id)}
              showName={false}
            />
          ))}
        </div>
        <div className="font-pixel text-xs" style={{ color: C.green }}>
          LOCKED IN: {lockedCount}/{players.length}
        </div>
      </div>
    </div>
  );
}
