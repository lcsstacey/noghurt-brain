'use client';

import { Flame } from 'lucide-react';
import { C } from '@/styles/palette';
import { PhoneShell } from '@/components/phases/lobby/PhoneShell';
import { toPlayer } from '@/lib/game/colorIcon';
import type { Database } from '@/lib/database.types';

type PlayerRow = Database['public']['Tables']['players']['Row'];

export function MainframeIntroPhone({ me }: { me: PlayerRow }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: C.bg }}>
      <PhoneShell you={toPlayer(me)} accent={C.purple}>
        <div className="h-full flex flex-col items-center justify-center text-center gap-3 py-8">
          <Flame size={48} className="warning-pulse" style={{ color: C.pink }} />
          <div className="font-pixel text-sm glitch" style={{ color: C.purple }}>
            THE MAINFRAME
          </div>
          <div className="font-crt text-lg text-zinc-300 leading-tight px-2">
            Place your wager.
            <br />
            Be brave.
            <br />
            Be wrong → lose it all.
          </div>
        </div>
      </PhoneShell>
    </div>
  );
}
