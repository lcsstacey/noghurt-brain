'use client';

import { Lock } from 'lucide-react';
import { C } from '@/styles/palette';
import { PhoneShell } from '@/components/phases/lobby/PhoneShell';
import { toPlayer } from '@/lib/game/colorIcon';
import type { Database } from '@/lib/database.types';

type PlayerRow = Database['public']['Tables']['players']['Row'];

export function LockedPhone({ me }: { me: PlayerRow }) {
  const player = toPlayer(me);
  const color = C[player.color];

  return (
    <div className="min-h-screen" style={{ backgroundColor: C.bg }}>
      <PhoneShell you={player}>
        <div className="h-full flex flex-col items-center justify-center text-center gap-3 py-8">
          <Lock
            size={48}
            className="pixel-pop"
            style={{ color, filter: `drop-shadow(0 0 12px ${color})` }}
          />
          <div className="font-pixel text-base text-glow" style={{ color }}>
            LOCKED IN
          </div>
          <div className="font-crt text-lg text-zinc-400">awaiting other players…</div>
          <div className="flex gap-1 mt-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 animate-pulse"
                style={{ background: color, animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </PhoneShell>
    </div>
  );
}
