'use client';

import { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import { C } from '@/styles/palette';
import { TimerBar } from '@/components/shared/TimerBar';
import { PhoneShell } from '@/components/phases/lobby/PhoneShell';
import { useQuestionTimer, PHASE_DURATION_SEC } from '@/lib/game/useQuestionTimer';
import { submitWager } from '@/lib/actions/submitWager';
import { toPlayer } from '@/lib/game/colorIcon';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/database.types';

type PlayerRow = Database['public']['Tables']['players']['Row'];

type Props = {
  code: string;
  me: PlayerRow;
  startedAt: string | null;
};

export function WagerPhone({ code, me, startedAt }: Props) {
  const player = toPlayer(me);
  const totalSec = PHASE_DURATION_SEC.wager;
  const { secondsLeft } = useQuestionTimer(startedAt, totalSec);
  const max = Math.max(100, me.score);
  const [val, setVal] = useState(Math.max(100, Math.floor(me.score * 0.5)));
  const [locked, setLocked] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [supabase] = useState(() => createClient());

  // Detect already-locked (e.g. on reload).
  useEffect(() => {
    let cancelled = false;
    supabase
      .from('wagers')
      .select('amount')
      .eq('player_id', me.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled && data) setLocked(data.amount);
      });
    return () => {
      cancelled = true;
    };
  }, [me.id, supabase]);

  const handleLock = async () => {
    setError(null);
    const cap = Math.min(val, me.score);
    const result = await submitWager(code, cap);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setLocked(cap);
  };

  if (locked != null) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: C.bg }}>
        <PhoneShell you={player} accent={C.purple}>
          <div className="h-full flex flex-col items-center justify-center text-center gap-3 py-8">
            <Lock
              size={40}
              style={{ color: C.yellow, filter: `drop-shadow(0 0 10px ${C.yellow})` }}
            />
            <div className="font-pixel text-xs text-glow" style={{ color: C.yellow }}>
              WAGER LOCKED
            </div>
            <div className="font-pixel text-3xl text-glow" style={{ color: C.yellow }}>
              {locked.toLocaleString()}
            </div>
            <div className="font-crt text-base text-zinc-500">awaiting question…</div>
          </div>
        </PhoneShell>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: C.bg }}>
      <PhoneShell you={player} accent={C.purple}>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div
              className="font-pixel text-[9px] tabular-nums"
              style={{ color: secondsLeft < 4 ? C.red : C.yellow }}
            >
              {Math.ceil(secondsLeft).toString().padStart(2, '0')}s
            </div>
            <div className="flex-1">
              <TimerBar time={secondsLeft} total={totalSec} ominous />
            </div>
          </div>
          <div className="font-pixel text-[10px] text-center" style={{ color: C.purple }}>
            ★ MAINFRAME WAGER ★
          </div>
          <div className="font-pixel text-[9px] text-zinc-500 text-center">
            SCORE: {me.score.toLocaleString()}
          </div>

          <div className="text-center py-2">
            <div className="font-pixel text-[9px] text-zinc-500 mb-1">YOU WAGER</div>
            <div className="font-pixel text-3xl text-glow" style={{ color: C.yellow }}>
              {val.toLocaleString()}
            </div>
          </div>

          <input
            type="range"
            min={Math.min(0, max)}
            max={max}
            value={val}
            onChange={(e) => setVal(parseInt(e.target.value))}
            className="w-full accent-yellow-400"
          />

          <div className="grid grid-cols-3 gap-1.5">
            {([0.25, 0.5, 1] as const).map((f) => (
              <button
                key={f}
                onClick={() => setVal(Math.max(0, Math.floor(max * f)))}
                className="btn-3d font-pixel text-[9px] py-2"
                style={{ color: f === 1 ? C.red : C.cyan, background: '#0a0a0a' }}
              >
                {f === 1 ? 'ALL IN' : f === 0.5 ? 'HALF' : 'QTR'}
              </button>
            ))}
          </div>

          <button
            onClick={handleLock}
            className="btn-3d font-pixel text-xs w-full py-3"
            style={{ color: C.yellow, background: '#0a0a0a' }}
          >
            <span className="flex items-center justify-center gap-2">
              <Lock size={14} />
              LOCK WAGER
            </span>
          </button>

          {error && (
            <div className="font-pixel text-xs text-center" style={{ color: C.red }}>
              ✗ {error}
            </div>
          )}
        </div>
      </PhoneShell>
    </div>
  );
}
