'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Check, X } from 'lucide-react';
import { C } from '@/styles/palette';
import { PhoneShell } from '@/components/phases/lobby/PhoneShell';
import { toPlayer } from '@/lib/game/colorIcon';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/database.types';

type PlayerRow = Database['public']['Tables']['players']['Row'];

type ResultPhoneProps = {
  me: PlayerRow;
  questionId: string;
  final?: boolean;
};

export function ResultPhone({ me, questionId, final = false }: ResultPhoneProps) {
  const [supabase] = useState(() => createClient());
  const [result, setResult] = useState<'correct' | 'wrong' | 'timeout' | 'loading'>('loading');
  const [points, setPoints] = useState(0);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from('answers')
      .select('is_correct, points_awarded')
      .eq('player_id', me.id)
      .eq('question_id', questionId)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        if (!data) {
          setResult('timeout');
          return;
        }
        setResult(data.is_correct ? 'correct' : 'wrong');
        setPoints(data.points_awarded ?? 0);
      });
    return () => {
      cancelled = true;
    };
  }, [me.id, questionId, supabase]);

  const player = toPlayer(me);
  const ok = result === 'correct';
  const color = ok ? C.green : result === 'timeout' ? '#71717a' : C.red;

  return (
    <div className="min-h-screen" style={{ backgroundColor: C.bg }}>
      <PhoneShell you={player}>
        <div
          className={`h-full flex flex-col items-center justify-center text-center gap-3 py-8 ${ok ? 'pixel-pop' : 'shake'}`}
        >
          <div
            className="w-20 h-20 grid place-items-center border-4"
            style={{
              borderColor: color,
              background: `${color}22`,
              boxShadow: `0 0 20px ${color}`,
            }}
          >
            {ok && <Check size={48} style={{ color }} />}
            {result === 'wrong' && <X size={48} style={{ color }} />}
            {result === 'timeout' && <AlertTriangle size={40} style={{ color }} />}
            {result === 'loading' && <div className="font-pixel text-xs">…</div>}
          </div>
          <div className="font-pixel text-base text-glow" style={{ color }}>
            {result === 'correct' && 'CORRECT'}
            {result === 'wrong' && 'WRONG'}
            {result === 'timeout' && 'TIME UP'}
            {result === 'loading' && '…'}
          </div>
          <div
            className="font-pixel text-2xl text-glow-soft"
            style={{ color: ok ? C.yellow : '#52525b' }}
          >
            {ok && `+${points}`}
            {!ok && final && points < 0 && `${points}`}
            {!ok && (!final || points === 0) && '+0'}
          </div>
          <div className="font-pixel text-[9px] text-zinc-500">
            SCORE: <span style={{ color: C[player.color] }}>{me.score.toLocaleString()}</span>
          </div>
          {me.streak > 1 && (
            <div className="font-pixel text-[9px] mt-1" style={{ color: C.pink }}>
              🔥 STREAK ×{me.streak}
            </div>
          )}
        </div>
      </PhoneShell>
    </div>
  );
}
