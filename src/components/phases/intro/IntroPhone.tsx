'use client';

import { Radio } from 'lucide-react';
import { C } from '@/styles/palette';
import { PhoneShell } from '@/components/phases/lobby/PhoneShell';
import { toPlayer } from '@/lib/game/colorIcon';
import type { Database } from '@/lib/database.types';

type PlayerRow = Database['public']['Tables']['players']['Row'];

type IntroPhoneProps = {
  me: PlayerRow;
  roundIndex: number;
  totalRounds: number;
};

export function IntroPhone({ me, roundIndex, totalRounds }: IntroPhoneProps) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: C.bg }}>
      <PhoneShell you={toPlayer(me)}>
        <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-8">
          <Radio size={36} className="warning-pulse" style={{ color: C.cyan }} />
          <div className="font-pixel text-[10px] text-zinc-500">▸ ROUND</div>
          <div className="font-pixel text-3xl text-glow" style={{ color: C.cyan }}>
            {(roundIndex + 1).toString().padStart(2, '0')}
            <span className="text-zinc-700 mx-2">/</span>
            <span className="text-zinc-500">{totalRounds.toString().padStart(2, '0')}</span>
          </div>
          <div className="font-pixel text-sm text-glow flicker" style={{ color: C.green }}>
            GET READY
          </div>
        </div>
      </PhoneShell>
    </div>
  );
}
