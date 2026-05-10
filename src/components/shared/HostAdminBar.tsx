'use client';

import { useState, useTransition } from 'react';
import { Crown, Power, RotateCcw, UserMinus, X } from 'lucide-react';
import { C } from '@/styles/palette';
import { useHostAdmin } from '@/lib/game/HostAdminContext';
import { startGame } from '@/lib/actions/startGame';
import { hostResetRoom } from '@/lib/actions/hostResetRoom';
import type { Database } from '@/lib/database.types';

type RoomRow = Database['public']['Tables']['rooms']['Row'];
type PlayerRow = Database['public']['Tables']['players']['Row'];

type Props = {
  code: string;
  room: RoomRow;
  players: PlayerRow[];
};

/**
 * Small fixed bar at the top of the screen — visible only when the host
 * is viewing. Carries the room code, player count, phase indicator, and
 * phase-conditional action buttons (start game / kick mode toggle in
 * lobby; run-it-back in game over). Reads kickMode from HostAdminContext.
 */
export function HostAdminBar({ code, room, players }: Props) {
  const { kickMode, setKickMode } = useHostAdmin();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleStart = () => {
    setError(null);
    startTransition(async () => {
      const r = await startGame(code);
      if (!r.ok) setError(r.error);
    });
  };

  const handleReset = () => {
    setError(null);
    startTransition(async () => {
      const r = await hostResetRoom(code);
      if (!r.ok) setError(r.error);
    });
  };

  const phaseLabel = room.phase.replace(/_/g, ' ').toUpperCase();
  const canStart = players.length >= 2 && room.phase === 'lobby';

  return (
    <div
      className="fixed top-0 left-0 right-0 z-40 bg-black border-b-2 px-3 py-2 flex items-center gap-3 flex-wrap"
      style={{ borderColor: C.pink + '88' }}
    >
      <div className="flex items-center gap-2">
        <Crown size={14} style={{ color: C.pink, filter: `drop-shadow(0 0 4px ${C.pink})` }} />
        <span className="font-pixel text-[10px] text-glow" style={{ color: C.pink }}>
          HOST
        </span>
      </div>

      <div className="font-pixel text-[10px] text-zinc-400">
        ROOM <span style={{ color: C.yellow }}>{code}</span>
      </div>

      <div className="font-pixel text-[10px] text-zinc-400">
        <span style={{ color: C.green }}>{players.length}</span>
        <span className="text-zinc-700">/8</span>
      </div>

      <div className="font-pixel text-[10px] text-zinc-500 hidden sm:block">▸ {phaseLabel}</div>

      <div className="ml-auto flex items-center gap-2 flex-wrap">
        {room.phase === 'lobby' && (
          <>
            <button
              type="button"
              onClick={() => setKickMode(!kickMode)}
              className="btn-3d font-pixel text-[9px] px-2 py-1 bg-black flex items-center gap-1"
              style={{ color: kickMode ? C.red : '#52525b' }}
            >
              {kickMode ? <X size={10} /> : <UserMinus size={10} />}
              {kickMode ? 'KICK MODE: ON' : 'KICK MODE'}
            </button>
            <button
              type="button"
              onClick={handleStart}
              disabled={!canStart || isPending}
              className="btn-3d font-pixel text-[9px] px-3 py-1 bg-black flex items-center gap-1 disabled:opacity-30"
              style={{ color: C.green }}
            >
              <Power size={10} className={isPending ? 'warning-pulse' : ''} />
              {isPending ? 'INITIALIZING…' : 'START GAME'}
            </button>
          </>
        )}

        {room.phase === 'game_over' && (
          <button
            type="button"
            onClick={handleReset}
            disabled={isPending}
            className="btn-3d font-pixel text-[9px] px-3 py-1 bg-black flex items-center gap-1 disabled:opacity-30"
            style={{ color: C.cyan }}
          >
            <RotateCcw size={10} className={isPending ? 'animate-spin' : ''} />
            {isPending ? 'RESETTING…' : 'RUN IT BACK'}
          </button>
        )}
      </div>

      {error && (
        <div className="w-full font-pixel text-[10px] text-center mt-1" style={{ color: C.red }}>
          ✗ {error}
        </div>
      )}
    </div>
  );
}
