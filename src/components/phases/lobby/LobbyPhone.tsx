'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { C } from '@/styles/palette';
import { PlayerAvatar } from '@/components/shared/PlayerAvatar';
import { PhoneShell } from '@/components/phases/lobby/PhoneShell';
import { useRoomChannel } from '@/lib/realtime/useRoomChannel';
import { useHostAdmin } from '@/lib/game/HostAdminContext';
import { kickPlayer } from '@/lib/actions/kickPlayer';
import { toPlayer } from '@/lib/game/colorIcon';

type LobbyPhoneProps = {
  code: string;
  playerId: string;
};

/**
 * Player phone view, post-join. Shows the player's own avatar large, plus
 * a "WAITING FOR HOST" status and a compact grid of all players (so the
 * host's KICK MODE can hit them on mobile too).
 */
export function LobbyPhone({ code, playerId }: LobbyPhoneProps) {
  const { players } = useRoomChannel(code);
  const { kickMode } = useHostAdmin();
  const [error, setError] = useState<string | null>(null);
  const me = players.find((p) => p.id === playerId);

  const handleKick = async (id: string, name: string) => {
    if (!window.confirm(`Kick ${name}?`)) return;
    const r = await kickPlayer(code, id);
    if (!r.ok) setError(r.error);
  };

  if (!me) {
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
        <div className="h-full flex flex-col items-center text-center gap-4 py-8">
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

          {/* Compact grid of all players so the host can kick from mobile too. */}
          {players.length > 1 && (
            <div className="w-full mt-2">
              <div className="font-pixel text-[8px] text-zinc-500 mb-2">
                ROSTER · {players.length}/8
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {players.map((p) => {
                  const pl = toPlayer(p);
                  const isMe = p.id === playerId;
                  const showKick = kickMode && !isMe;
                  return (
                    <div key={p.id} className="relative">
                      <PlayerAvatar player={pl} size={36} showName={false} />
                      {showKick && (
                        <button
                          type="button"
                          onClick={() => handleKick(p.id, p.name)}
                          aria-label={`Kick ${p.name}`}
                          className="absolute -top-1 -right-1 w-4 h-4 grid place-items-center border bg-black"
                          style={{ borderColor: C.red, color: C.red }}
                        >
                          <X size={8} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {error && (
            <div className="font-pixel text-[10px]" style={{ color: C.red }}>
              ✗ {error}
            </div>
          )}

          <div className="font-pixel text-[8px] text-zinc-600 mt-2">
            ROOM <span style={{ color: C.yellow }}>{code}</span>
          </div>
        </div>
      </PhoneShell>
    </div>
  );
}
