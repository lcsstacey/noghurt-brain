'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Check, X } from 'lucide-react';
import { C } from '@/styles/palette';
import { PlayerAvatar } from '@/components/shared/PlayerAvatar';
import { CATEGORIES } from '@/lib/game/categories';
import { QUESTIONS_BY_ID } from '@/data/questions';
import { useRoomChannel } from '@/lib/realtime/useRoomChannel';
import { hostAdvance } from '@/lib/actions/hostAdvance';
import { PHASE_ADVANCE_MS } from '@/lib/game/useQuestionTimer';
import { toPlayer } from '@/lib/game/colorIcon';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/database.types';

type AnswerRow = Database['public']['Tables']['answers']['Row'];

type RevealHostProps = {
  code: string;
  isHost: boolean;
  questionId: string;
  final?: boolean;
};

export function RevealHost({ code, isHost, questionId, final = false }: RevealHostProps) {
  const router = useRouter();
  const advanced = useRef(false);
  const { players } = useRoomChannel(code);
  const [answers, setAnswers] = useState<AnswerRow[]>([]);
  const [supabase] = useState(() => createClient());

  // Fetch graded answers for this question via SECURITY DEFINER RPC
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: rooms } = await supabase.rpc('find_room_by_code', {
        p_code: code.toUpperCase(),
      });
      const room = rooms?.[0];
      if (!room) return;
      const { data } = await supabase.rpc('list_room_answers', {
        p_room_id: room.id,
        p_question_id: questionId,
      });
      if (!cancelled) setAnswers(data ?? []);
    })();
    return () => {
      cancelled = true;
    };
  }, [code, questionId, supabase]);

  // Auto-advance after PHASE_ADVANCE_MS.reveal
  useEffect(() => {
    if (!isHost || advanced.current) return;
    const ms = final ? PHASE_ADVANCE_MS.final_reveal : PHASE_ADVANCE_MS.reveal;
    const id = setTimeout(async () => {
      if (advanced.current) return;
      advanced.current = true;
      const result = await hostAdvance(code);
      if (result.ok) router.refresh();
    }, ms);
    return () => clearTimeout(id);
  }, [code, isHost, router, final]);

  const question = QUESTIONS_BY_ID[questionId];
  if (!question) return null;
  const cat = CATEGORIES[question.cat];
  const Icon = cat.Icon;

  let correctText = '';
  if (question.type === 'classic') correctText = question.options[question.correct];
  else if (question.type === 'decryptor') correctText = question.answer;

  const sorted = [...players].sort((a, b) => b.score - a.score);
  const answerByPlayer = new Map(answers.map((a) => [a.player_id, a]));

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center gap-3">
        <Icon size={20} style={{ color: cat.color }} />
        <div className="font-pixel text-xs" style={{ color: cat.color }}>
          {cat.name}
        </div>
        {final && (
          <div className="font-pixel text-xs px-2 py-1 mainframe-bg text-black">★ MAINFRAME ★</div>
        )}
      </div>

      <div className="font-pixel text-base sm:text-lg leading-relaxed text-zinc-300 text-center">
        {question.prompt}
      </div>

      <div className="text-center pixel-pop space-y-2">
        <div className="font-pixel text-[10px]" style={{ color: C.green }}>
          ▸ ANSWER UNLOCKED
        </div>
        <div
          className="font-pixel text-2xl sm:text-4xl text-glow inline-block px-4 py-3"
          style={{ color: C.green, background: 'rgba(57,255,20,0.08)', border: `3px solid ${C.green}` }}
        >
          {correctText}
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-2 justify-center">
        {sorted.map((p, i) => {
          const a = answerByPlayer.get(p.id);
          const result = a ? (a.is_correct ? 'correct' : 'wrong') : 'timeout';
          const points = a?.points_awarded ?? 0;
          const player = toPlayer(p);
          return (
            <div
              key={p.id}
              className="flex items-center gap-3 slide-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="font-pixel text-2xl w-8 text-zinc-500 text-center">{i + 1}</div>
              <PlayerAvatar
                player={player}
                size={42}
                showName={false}
                glow={result === 'correct'}
                dim={result !== 'correct'}
              />
              <div className="font-pixel text-xs flex-1" style={{ color: C[player.color] }}>
                {player.name}
              </div>
              <div
                className="font-pixel text-xs"
                style={{
                  color:
                    result === 'correct' ? C.green : result === 'wrong' ? C.red : '#52525b',
                }}
              >
                {result === 'correct' && (
                  <span className="flex items-center gap-1">
                    <Check size={14} />+{points}
                  </span>
                )}
                {result === 'wrong' && (
                  <span className="flex items-center gap-1">
                    <X size={14} />
                    {final ? points : '0'}
                  </span>
                )}
                {result === 'timeout' && (
                  <span className="flex items-center gap-1">
                    <AlertTriangle size={14} />—
                  </span>
                )}
              </div>
              <div
                className="font-pixel text-base tabular-nums w-20 text-right text-glow-soft"
                style={{ color: C[player.color] }}
              >
                {p.score.toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
