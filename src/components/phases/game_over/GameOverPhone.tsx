'use client';

import { Crown, Trophy } from 'lucide-react';
import { C } from '@/styles/palette';
import { PhoneShell } from '@/components/phases/lobby/PhoneShell';
import { useRoomChannel } from '@/lib/realtime/useRoomChannel';
import { toPlayer } from '@/lib/game/colorIcon';
import type { Database } from '@/lib/database.types';

type PlayerRow = Database['public']['Tables']['players']['Row'];

const ORDINALS = ['st', 'nd', 'rd'] as const;
function placeSuffix(n: number) {
  if (n >= 11 && n <= 13) return 'th';
  return ORDINALS[((n - 1) % 10) as 0 | 1 | 2] ?? 'th';
}

export function GameOverPhone({ code, me }: { code: string; me: PlayerRow }) {
  const { players } = useRoomChannel(code);
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const place = sorted.findIndex((p) => p.id === me.id) + 1;
  const won = place === 1;
  const player = toPlayer(me);
  const color = C[player.color];

  return (
    <div className="min-h-screen" style={{ backgroundColor: C.bg }}>
      <PhoneShell you={player}>
        <div className="h-full flex flex-col items-center justify-center text-center gap-3 py-8">
          {won ? (
            <Crown size={52} className="warning-pulse" style={{ color: C.yellow }} />
          ) : (
            <Trophy size={42} style={{ color: C.cyan }} />
          )}
          <div className="font-pixel text-base text-glow" style={{ color: won ? C.yellow : color }}>
            {won ? 'YOU WON' : `${place}${placeSuffix(place)} PLACE`}
          </div>
          <div className="font-pixel text-2xl text-glow-soft" style={{ color }}>
            {me.score.toLocaleString()}
          </div>
          <div className="font-crt text-base text-zinc-500 mt-2">
            host can RUN IT BACK
          </div>
        </div>
      </PhoneShell>
    </div>
  );
}
