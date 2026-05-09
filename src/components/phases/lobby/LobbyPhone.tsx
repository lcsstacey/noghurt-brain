'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { C } from '@/styles/palette';
import { PlayerAvatar } from '@/components/shared/PlayerAvatar';
import { PhoneShell } from '@/components/phases/lobby/PhoneShell';
import { useRoomChannel } from '@/lib/realtime/useRoomChannel';
import { toPlayer } from '@/lib/game/colorIcon';

type LobbyPhoneProps = {
  code: string;
  playerId: string;
};

/**
 * Player phone view, post-join. Shows the player's own avatar large, plus
 * a "WAITING FOR HOST" status. When the host starts the game, the room
 * phase advances and the page re-renders into the (Phase 3) intro view.
 *
 * Ported from prototypes/noghurt-brain.tsx lines 1116–1137.
 */
export function LobbyPhone({ code, playerId }: LobbyPhoneProps) {
  const router = useRouter();
  const { room, players } = useRoomChannel(code);
  const me = players.find((p) => p.id === playerId);

  // When the host advances out of lobby, refresh so the page renders the
  // new phase view. (Phase 3 will own those views; for now Phase 2 just
  // bounces the player to a "round starting" placeholder.)
  useEffect(() => {
    if (room && room.phase !== 'lobby') {
      router.refresh();
    }
  }, [room, router]);

  if (!me) {
    // RLS or stale playerId — bounce to join screen.
    return (
      <div className="min-h-screen grid place-items-center" style={{ backgroundColor: C.bg }}>
        <div className="font-pixel text-xs text-zinc-500">RECONNECTING…</div>
      </div>
    );
  }

  const player = toPlayer(me);

  return (
    <div className="min-h-screen" style={{ backgroundColor: C.bg }}>
      <PhoneShell you={player}>
        <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-8">
          <PlayerAvatar player={player} size={80} showName={false} glow />
          <div className="font-pixel text-base text-glow" style={{ color: C[player.color] }}>
            {player.name}
          </div>
          <div className="font-pixel text-[9px] text-zinc-500">▸ JOINED LOBBY</div>

          <div className="border-2 px-4 py-3 mt-2" style={{ borderColor: C.green }}>
            <div className="font-pixel text-[8px] text-zinc-500">STATUS</div>
            <div className="font-pixel text-sm flicker" style={{ color: C.green }}>
              WAITING FOR HOST
            </div>
            <div className="flex justify-center gap-1 mt-2">
              <div className="w-1.5 h-1.5 bg-green-400 animate-pulse" />
              <div
                className="w-1.5 h-1.5 bg-green-400 animate-pulse"
                style={{ animationDelay: '0.2s' }}
              />
              <div
                className="w-1.5 h-1.5 bg-green-400 animate-pulse"
                style={{ animationDelay: '0.4s' }}
              />
            </div>
          </div>

          <div className="font-pixel text-[8px] text-zinc-600 mt-2">
            ROOM <span style={{ color: C.yellow }}>{code}</span> · {players.length}/8
          </div>
        </div>
      </PhoneShell>
    </div>
  );
}
