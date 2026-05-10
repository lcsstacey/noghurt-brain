'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Flame, Lock } from 'lucide-react';
import { C } from '@/styles/palette';
import { PlayerAvatar } from '@/components/shared/PlayerAvatar';
import { TimerBar } from '@/components/shared/TimerBar';
import { CATEGORIES } from '@/lib/game/categories';
import { QUESTIONS_BY_ID } from '@/data/questions';
import { useRoomChannel } from '@/lib/realtime/useRoomChannel';
import { useQuestionTimer, PHASE_DURATION_SEC, PHASE_ADVANCE_MS } from '@/lib/game/useQuestionTimer';
import { hostGradeAndAdvance } from '@/lib/actions/hostGradeAndAdvance';
import { submitAnswer } from '@/lib/actions/submitAnswer';
import { toPlayer } from '@/lib/game/colorIcon';
import { ClassicHostBody } from './ClassicHostBody';
import { ClassicPhoneBody } from './ClassicPhoneBody';
import { DecryptorHostBody } from './DecryptorHostBody';
import { DecryptorPhoneBody } from './DecryptorPhoneBody';
import { createClient } from '@/lib/supabase/client';

type QuestionHostProps = {
  code: string;
  isHost: boolean;
  /** The host's own player_id, so they can answer alongside everyone else. */
  hostPlayerId?: string;
  questionId: string;
  roundIndex: number;
  totalRounds: number;
  startedAt: string | null;
  final?: boolean;
};

/**
 * Host's full question screen. Reads server-stamped started_at, drives
 * the timer, and (if isHost) calls hostGradeAndAdvance when timer expires
 * OR all players have locked in.
 */
export function QuestionHost({
  code,
  isHost,
  hostPlayerId,
  questionId,
  roundIndex,
  totalRounds,
  startedAt,
  final = false,
}: QuestionHostProps) {
  const router = useRouter();
  const advanced = useRef(false);
  const { players } = useRoomChannel(code);
  const [hostLocked, setHostLocked] = useState(false);
  const [hostError, setHostError] = useState<string | null>(null);

  const totalSec = final ? PHASE_DURATION_SEC.final_question : PHASE_DURATION_SEC.question;
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

  // Detect host's own existing answer so a reload doesn't show the input again.
  useEffect(() => {
    if (!hostPlayerId) return;
    let cancelled = false;
    supabase.current
      .from('answers')
      .select('id')
      .eq('player_id', hostPlayerId)
      .eq('question_id', questionId)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled && data) setHostLocked(true);
      });
    return () => {
      cancelled = true;
    };
  }, [hostPlayerId, questionId]);

  const handleHostLock = async (answer: number | string) => {
    setHostError(null);
    const result = await submitAnswer({ code, questionId, answer });
    if (!result.ok) {
      setHostError(result.error);
      return;
    }
    setHostLocked(true);
  };

  const question = QUESTIONS_BY_ID[questionId];
  if (!question) return null;
  const cat = CATEGORIES[question.cat];
  const Icon = cat.Icon;
  const lockedCount = players.filter((p) => lockedRef.current.has(p.id)).length;
  const timerColor =
    secondsLeft < totalSec * 0.25 ? C.red : secondsLeft < totalSec * 0.5 ? C.yellow : C.green;

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Icon size={20} style={{ color: cat.color }} />
          <div className="font-pixel text-xs" style={{ color: cat.color }}>
            {cat.name}
          </div>
          {final && (
            <div className="font-pixel text-xs px-2 py-1 mainframe-bg text-black">★ MAINFRAME ★</div>
          )}
        </div>
        <div className="font-pixel text-xs text-zinc-400">
          ROUND <span style={{ color: C.cyan }}>{roundIndex + 1}</span>
          <span className="text-zinc-700 mx-1">/</span>
          {totalRounds}
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
        {question.type === 'classic' && <ClassicHostBody q={question} />}
        {question.type === 'decryptor' && (
          <DecryptorHostBody q={question} secondsLeft={secondsLeft} totalSec={totalSec} />
        )}
      </div>

      {/* Host plays too — gets their own answer interface below the TV display. */}
      {isHost && hostPlayerId && !hostLocked && (
        <div
          className="mt-3 p-3 border-2 rounded"
          style={{ borderColor: C.cyan + '88', background: '#000' }}
        >
          <div className="font-pixel text-[10px] text-zinc-400 mb-2 flex items-center gap-2">
            <Lock size={10} style={{ color: C.cyan }} />
            <span>YOUR ANSWER (HOST)</span>
          </div>
          {question.type === 'classic' && (
            <ClassicPhoneBody q={question} onLock={handleHostLock} />
          )}
          {question.type === 'decryptor' && (
            <DecryptorPhoneBody onLock={handleHostLock} />
          )}
          {hostError && (
            <div className="font-pixel text-xs text-center mt-2" style={{ color: C.red }}>
              ✗ {hostError}
            </div>
          )}
        </div>
      )}

      {isHost && hostLocked && (
        <div
          className="mt-3 p-3 border-2 rounded text-center"
          style={{ borderColor: C.green, background: 'rgba(57,255,20,0.06)' }}
        >
          <div className="font-pixel text-xs flex items-center justify-center gap-2" style={{ color: C.green }}>
            <Lock size={12} />
            HOST LOCKED IN — awaiting other players
          </div>
        </div>
      )}

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
