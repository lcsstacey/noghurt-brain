'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { RotateCcw, Trophy } from 'lucide-react';
import { C } from '@/styles/palette';
import { PlayerAvatar } from '@/components/shared/PlayerAvatar';
import { useRoomChannel } from '@/lib/realtime/useRoomChannel';
import { hostResetRoom } from '@/lib/actions/hostResetRoom';
import { toPlayer } from '@/lib/game/colorIcon';

type Props = {
  code: string;
  isHost: boolean;
};

export function GameOverHost({ code, isHost }: Props) {
  const router = useRouter();
  const { players } = useRoomChannel(code);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const sorted = [...players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];
  const max = Math.max(1, ...sorted.map((p) => p.score));

  const handleReset = () => {
    setError(null);
    startTransition(async () => {
      const r = await hostResetRoom(code);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      router.refresh();
    });
  };

  if (!winner) return null;
  const winnerPlayer = toPlayer(winner);
  const winnerColor = C[winnerPlayer.color];

  return (
    <div className="flex flex-col h-full gap-5">
      <div className="text-center space-y-2">
        <div className="font-pixel text-xs text-zinc-500">▸ TRANSMISSION COMPLETE</div>
        <div className="font-pixel text-3xl sm:text-5xl text-glow" style={{ color: C.yellow }}>
          GAME OVER
        </div>
      </div>

      <div className="text-center space-y-3 pixel-pop">
        <Trophy size={56} className="mx-auto warning-pulse" style={{ color: winnerColor }} />
        <div className="font-pixel text-xs text-zinc-400">CHAMPION</div>
        <div className="flex items-center justify-center gap-3">
          <PlayerAvatar player={winnerPlayer} size={64} showName={false} />
          <div className="font-pixel text-2xl sm:text-4xl text-glow" style={{ color: winnerColor }}>
            {winnerPlayer.name}
          </div>
        </div>
        <div className="font-pixel text-2xl text-glow-soft" style={{ color: C.green }}>
          {winner.score.toLocaleString()} PTS
        </div>
      </div>

      <div className="flex-1 space-y-2.5">
        {sorted.map((p, i) => {
          const player = toPlayer(p);
          const color = C[player.color];
          return (
            <div
              key={p.id}
              className="flex items-center gap-3 slide-up"
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              <div className="font-pixel text-2xl w-8 text-zinc-500 text-center">{i + 1}</div>
              <PlayerAvatar player={player} size={36} showName={false} />
              <div className="font-pixel text-xs w-24" style={{ color }}>
                {player.name}
              </div>
              <div className="flex-1 h-5 bg-black border-2 border-zinc-800 relative overflow-hidden">
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${(p.score / max) * 100}%`,
                    background: color,
                    boxShadow: `0 0 8px ${color}`,
                  }}
                />
              </div>
              <div
                className="font-pixel text-sm tabular-nums w-20 text-right"
                style={{ color }}
              >
                {p.score.toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>

      {isHost && (
        <button
          onClick={handleReset}
          disabled={isPending}
          className="btn-3d font-pixel text-base w-full py-4 disabled:opacity-50"
          style={{ color: C.cyan, background: '#0a0a0a' }}
        >
          <span className="flex items-center justify-center gap-3">
            <RotateCcw size={18} className={isPending ? 'animate-spin' : ''} />
            {isPending ? 'RESETTING…' : 'RUN IT BACK'}
          </span>
        </button>
      )}

      {error && (
        <div className="font-pixel text-xs text-center" style={{ color: C.red }}>
          ✗ {error}
        </div>
      )}
    </div>
  );
}
