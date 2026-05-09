'use client';

import type { ReactNode } from 'react';
import { Radio } from 'lucide-react';
import { C } from '@/styles/palette';
import { PlayerAvatar } from '@/components/shared/PlayerAvatar';
import type { Player } from '@/lib/types';

type PhoneShellProps = {
  children: ReactNode;
  you: Player;
  accent?: string;
};

/**
 * Mobile screen header bar. Shows the player's small avatar + name + a
 * pulsing CONNECTED indicator. Wraps the phase-specific phone content.
 *
 * Ported from prototypes/noghurt-brain.tsx lines 1098–1114.
 */
export function PhoneShell({ children, you, accent }: PhoneShellProps) {
  const borderColor = accent ?? C[you.color];
  return (
    <div className="h-full flex flex-col">
      <div
        className="px-3 py-2 flex items-center justify-between border-b-2"
        style={{ borderColor, background: '#000' }}
      >
        <div className="flex items-center gap-2">
          <PlayerAvatar player={you} size={22} showName={false} />
          <div className="font-pixel text-[8px]" style={{ color: C[you.color] }}>
            {you.name}
          </div>
        </div>
        <div
          className="font-pixel text-[8px] flex items-center gap-1"
          style={{ color: C.green }}
        >
          <Radio size={8} className="animate-pulse" />
          CONNECTED
        </div>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar p-3">{children}</div>
    </div>
  );
}
