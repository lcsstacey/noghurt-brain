'use client';

import { useEffect, useState, useTransition } from 'react';
import { Crown, Power, RotateCcw, Settings, UserMinus, X } from 'lucide-react';
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
 * Host admin — slide-out drawer from the right edge.
 *
 * Hidden by default behind a small crown icon button (top-right). Click
 * to open: drawer slides in with all admin controls. Click outside or
 * press Esc to close. The KICK MODE toggle persists across open/close
 * via HostAdminContext, so the X overlays on player avatars stay
 * available even when the drawer is shut.
 */
export function HostAdminBar({ code, room, players }: Props) {
  const { kickMode, setKickMode } = useHostAdmin();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // ESC closes the drawer.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const handleStart = () => {
    setError(null);
    startTransition(async () => {
      const r = await startGame(code);
      if (!r.ok) setError(r.error);
      else setOpen(false);
    });
  };

  const handleReset = () => {
    setError(null);
    startTransition(async () => {
      const r = await hostResetRoom(code);
      if (!r.ok) setError(r.error);
      else setOpen(false);
    });
  };

  const phaseLabel = room.phase.replace(/_/g, ' ').toUpperCase();
  const canStart = players.length >= 2 && room.phase === 'lobby';

  return (
    <>
      {/* Trigger button — small crown badge top-right. Always visible to host. */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close admin' : 'Open host admin'}
        className="fixed top-3 right-3 z-50 w-10 h-10 grid place-items-center bg-black border-2 transition-all"
        style={{
          borderColor: C.pink + (open ? 'ff' : '88'),
          color: C.pink,
          boxShadow: open ? `0 0 16px ${C.pink}88` : `0 0 8px ${C.pink}44`,
        }}
      >
        {open ? <X size={18} /> : <Crown size={16} />}
      </button>

      {/* Backdrop. Tap-anywhere closes. */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          aria-hidden
        />
      )}

      {/* Drawer panel — slide in from the right. */}
      <aside
        className={`fixed top-0 right-0 bottom-0 z-40 w-80 max-w-[90vw] bg-black border-l-2 transition-transform duration-200 overflow-y-auto ${open ? 'translate-x-0' : 'translate-x-full'}`}
        style={{
          borderColor: C.pink + 'aa',
          boxShadow: `-12px 0 40px rgba(255,46,136,0.25)`,
        }}
        aria-hidden={!open}
      >
        <div className="p-5 pt-16 space-y-5">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Crown
                size={16}
                style={{ color: C.pink, filter: `drop-shadow(0 0 6px ${C.pink})` }}
              />
              <span className="font-pixel text-sm text-glow" style={{ color: C.pink }}>
                HOST CONTROL
              </span>
            </div>
            <div className="font-crt text-base text-zinc-500">
              Admin actions for this room. ESC to close.
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t-2 border-zinc-800">
            <Stat label="ROOM" value={code} accent={C.yellow} />
            <Stat
              label="PLAYERS"
              value={`${players.length}/8`}
              accent={C.green}
            />
            <Stat
              label="PHASE"
              value={phaseLabel}
              accent={C.cyan}
              span
            />
          </div>

          {/* Lobby actions */}
          {room.phase === 'lobby' && (
            <div className="space-y-3 pt-3 border-t-2 border-zinc-800">
              <button
                type="button"
                onClick={() => setKickMode(!kickMode)}
                className="btn-3d font-pixel text-xs w-full px-3 py-3 bg-black flex items-center justify-center gap-2"
                style={{ color: kickMode ? C.red : '#71717a' }}
              >
                <UserMinus size={14} />
                {kickMode ? 'KICK MODE: ON' : 'ENABLE KICK MODE'}
              </button>
              {kickMode && (
                <div className="font-crt text-base text-zinc-500 text-center">
                  Tap the × on any player avatar to kick them.
                </div>
              )}
              <button
                type="button"
                onClick={handleStart}
                disabled={!canStart || isPending}
                className="btn-3d font-pixel text-sm w-full px-3 py-4 bg-black flex items-center justify-center gap-2 disabled:opacity-30"
                style={{ color: C.green }}
              >
                <Power size={16} className={isPending ? 'warning-pulse' : ''} />
                {isPending
                  ? 'INITIALIZING…'
                  : players.length < 2
                    ? 'NEED 2+ PLAYERS'
                    : 'START GAME'}
              </button>
            </div>
          )}

          {/* Game over actions */}
          {room.phase === 'game_over' && (
            <div className="pt-3 border-t-2 border-zinc-800">
              <button
                type="button"
                onClick={handleReset}
                disabled={isPending}
                className="btn-3d font-pixel text-sm w-full px-3 py-4 bg-black flex items-center justify-center gap-2 disabled:opacity-30"
                style={{ color: C.cyan }}
              >
                <RotateCcw size={16} className={isPending ? 'animate-spin' : ''} />
                {isPending ? 'RESETTING…' : 'RUN IT BACK'}
              </button>
            </div>
          )}

          {/* Mid-game placeholder */}
          {room.phase !== 'lobby' && room.phase !== 'game_over' && (
            <div className="pt-3 border-t-2 border-zinc-800">
              <div className="font-pixel text-[10px] text-zinc-500 flex items-center gap-2">
                <Settings size={10} />
                <span>NO ADMIN ACTIONS THIS PHASE</span>
              </div>
              <div className="font-crt text-base text-zinc-600 mt-1">
                Game is in progress. Wait for the round to finish.
              </div>
            </div>
          )}

          {error && (
            <div
              className="font-pixel text-xs text-center p-2 border-2"
              style={{ color: C.red, borderColor: C.red + '88' }}
            >
              ✗ {error}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

function Stat({
  label,
  value,
  accent,
  span,
}: {
  label: string;
  value: string;
  accent: string;
  span?: boolean;
}) {
  return (
    <div className={span ? 'col-span-2' : undefined}>
      <div className="font-pixel text-[8px] text-zinc-500 mb-1">{label}</div>
      <div className="font-pixel text-base text-glow-soft" style={{ color: accent }}>
        {value}
      </div>
    </div>
  );
}
