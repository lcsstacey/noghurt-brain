'use client';

import { useEffect, useState, useTransition } from 'react';
import QRCode from 'qrcode';
import { Atom, ChevronRight, Gamepad2, Globe, Power, Radio, Wifi, X } from 'lucide-react';
import { C } from '@/styles/palette';
import { PlayerCard } from '@/components/shared/PlayerCard';
import { useRoomChannel } from '@/lib/realtime/useRoomChannel';
import { startGame } from '@/lib/actions/startGame';
import { kickPlayer } from '@/lib/actions/kickPlayer';
import { updateRoomSettings } from '@/lib/actions/updateRoomSettings';
import { useHostAdmin } from '@/lib/game/HostAdminContext';
import { toPlayer } from '@/lib/game/colorIcon';
import { DEFAULT_ROOM_SETTINGS, type RoomSettings } from '@/lib/types';
import type { Category } from '@/data/questions';

const CATEGORY_OPTIONS: Array<{ id: Category; name: string; Icon: typeof Atom; color: string }> = [
  { id: 'science', name: 'HARDCORE SCIENCE', Icon: Atom, color: C.cyan },
  { id: 'internet', name: 'INTERNET CULTURE', Icon: Wifi, color: C.pink },
  { id: 'geography', name: 'GEOGRAPHY', Icon: Globe, color: C.green },
  { id: 'retro', name: 'RETRO GAMING', Icon: Gamepad2, color: C.yellow },
];

const DIFFICULTY_OPTIONS = [
  { id: 'normal' as const, label: 'NORMAL', color: C.green, sub: 'Standard timing' },
  { id: 'nightmare' as const, label: 'NIGHTMARE', color: C.red, sub: 'Faster · Harder' },
];

const MIN_ROUNDS = 3;
const MAX_ROUNDS = 7;

type LobbyHostProps = {
  code: string;
  joinUrl: string;
  /** When set, shows the host-only "INITIATE BROADCAST" button inline. */
  showStartButton?: boolean;
  /** Caller's player_id, so kick UI can hide on caller's own avatar. */
  meId?: string;
  /** Whether the caller is the host (can edit settings). */
  isHost?: boolean;
};

/**
 * Host TV view of the lobby. Real-time player grid, room code,
 * QR code → /play/[code], and the INITIATE BROADCAST button.
 *
 * Categories / Difficulty / Rounds are visible but disabled — they're
 * v2-cut features per docs/MVP_SCOPE.md, surfaced as "V2" placeholders
 * to keep the prototype's visual rhythm.
 */
export function LobbyHost({
  code,
  joinUrl,
  showStartButton = true,
  meId,
  isHost = false,
}: LobbyHostProps) {
  const { room, players, status } = useRoomChannel(code);
  const { kickMode } = useHostAdmin();
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const settings = (room?.settings as RoomSettings | null) ?? DEFAULT_ROOM_SETTINGS;
  const settingsLocked = !isHost; // non-hosts see settings but can't change them

  const handleKick = async (playerId: string, name: string) => {
    if (!window.confirm(`Kick ${name}?`)) return;
    const r = await kickPlayer(code, playerId);
    if (!r.ok) setError(r.error);
  };

  const toggleCategory = async (id: Category) => {
    if (settingsLocked) return;
    const next = settings.categories.includes(id)
      ? settings.categories.filter((c) => c !== id)
      : [...settings.categories, id];
    if (next.length === 0) {
      setError('pick at least 1 category');
      return;
    }
    setError(null);
    const r = await updateRoomSettings(code, { categories: next });
    if (!r.ok) setError(r.error);
  };

  const setDifficulty = async (id: 'normal' | 'nightmare') => {
    if (settingsLocked) return;
    setError(null);
    const r = await updateRoomSettings(code, { difficulty: id });
    if (!r.ok) setError(r.error);
  };

  const setRounds = async (n: number) => {
    if (settingsLocked) return;
    const clamped = Math.max(MIN_ROUNDS, Math.min(MAX_ROUNDS, n));
    if (clamped === settings.rounds_count) return;
    setError(null);
    const r = await updateRoomSettings(code, { rounds_count: clamped });
    if (!r.ok) setError(r.error);
  };

  useEffect(() => {
    QRCode.toDataURL(joinUrl, {
      margin: 1,
      width: 110,
      color: { dark: '#000000', light: '#ffffff' },
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, [joinUrl]);

  // Phase advance is observed by the parent HostPhaseRouter via the same
  // useRoomChannel — no router.refresh dance needed. We just call startGame
  // and let realtime propagate.

  const handleStart = () => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await startGame(code);
        if (!result.ok) {
          // Loud error so a stuck host can see what's wrong.
          // eslint-disable-next-line no-console
          console.error('[LobbyHost] startGame failed:', result.error);
          setError(result.error);
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'startGame threw';
        // eslint-disable-next-line no-console
        console.error('[LobbyHost] startGame threw:', e);
        setError(msg);
      }
    });
  };

  const canStart =
    players.length >= 2 &&
    settings.categories.length >= 1 &&
    (status === 'subscribed' || status === 'loading');

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* Header — status + headline + QR + room code */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="font-pixel text-[10px] text-zinc-500 mb-1 flex items-center gap-2">
            <Radio size={10} className="animate-pulse" style={{ color: C.green }} />
            <span>SYS:// BROADCAST READY</span>
            <span className="blink" style={{ color: C.green }}>
              ▓
            </span>
          </div>
          <h1
            className="font-pixel text-3xl sm:text-5xl glitch-slow leading-tight"
            style={{ color: C.pink }}
          >
            NOGHURT
            <br />
            <span style={{ color: C.cyan }}>BRAIN</span>
          </h1>
          <div className="font-crt text-xl mt-1" style={{ color: C.green }}>
            v0.1.0 // PARTY TRIVIA NETWORK
          </div>
        </div>

        <div className="flex items-center gap-4">
          {qrDataUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrDataUrl}
              alt={`QR code linking to ${joinUrl}`}
              width={110}
              height={110}
              className="bg-white p-1"
            />
          )}
          <div className="font-pixel text-xs">
            <div className="text-zinc-400">JOIN AT:</div>
            <div className="text-glow-soft" style={{ color: C.cyan }}>
              {joinUrl.replace(/^https?:\/\//, '')}
            </div>
            <div className="text-zinc-400 mt-3">ROOM CODE:</div>
            <div className="text-2xl font-pixel text-glow" style={{ color: C.yellow }}>
              {code}
            </div>
          </div>
        </div>
      </div>

      {/* Player grid + ROUNDS stepper inline (right of the 8th slot). */}
      <div>
        <div className="font-pixel text-xs text-zinc-400 mb-3 flex items-center gap-2">
          <span style={{ color: C.green }}>▸</span>
          PLAYERS CONNECTED{' '}
          <span style={{ color: C.green }}>[{players.length}/8]</span>
        </div>
        <div className="flex flex-wrap gap-5 items-start">
          {players.map((p, i) => {
            const player = toPlayer(p);
            const isMe = meId === p.id;
            const showKick = kickMode && !isMe;
            return (
              <div
                key={p.id}
                className="pixel-pop relative"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <PlayerCard player={player} scale={5} />
                {showKick && (
                  <button
                    type="button"
                    onClick={() => handleKick(p.id, p.name)}
                    aria-label={`Kick ${p.name}`}
                    className="absolute -top-2 -right-2 w-6 h-6 grid place-items-center border-2 bg-black z-10"
                    style={{ borderColor: C.red, color: C.red }}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            );
          })}
          {Array.from({ length: 8 - players.length }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 opacity-30">
              <div className="w-[68px] h-[68px] border-2 border-dashed border-zinc-700 grid place-items-center font-pixel text-zinc-600">
                ?
              </div>
              <div className="font-pixel text-[9px] text-zinc-600">EMPTY</div>
            </div>
          ))}

          {/* ROUNDS stepper sits right of the 8th slot with a small gap. */}
          <div
            className={`ml-2 flex flex-col items-center justify-center gap-1.5 px-3 ${
              settingsLocked ? 'opacity-70 pointer-events-none' : ''
            }`}
          >
            <div className="font-pixel text-[9px] text-zinc-500 flex items-center gap-1">
              <span style={{ color: C.cyan }}>▸</span>ROUNDS
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRounds(settings.rounds_count - 1)}
                disabled={settings.rounds_count <= MIN_ROUNDS}
                aria-label="Decrease rounds"
                className="font-pixel text-base w-7 h-7 border-2 border-zinc-700 hover:border-cyan-400 text-zinc-300 disabled:opacity-30 disabled:hover:border-zinc-700"
              >
                −
              </button>
              <div
                className="font-pixel text-3xl text-glow tabular-nums w-9 text-center leading-none"
                style={{ color: C.cyan }}
              >
                {settings.rounds_count}
              </div>
              <button
                type="button"
                onClick={() => setRounds(settings.rounds_count + 1)}
                disabled={settings.rounds_count >= MAX_ROUNDS}
                aria-label="Increase rounds"
                className="font-pixel text-base w-7 h-7 border-2 border-zinc-700 hover:border-cyan-400 text-zinc-300 disabled:opacity-30 disabled:hover:border-zinc-700"
              >
                +
              </button>
            </div>
            <div className="font-crt text-xs text-zinc-500 leading-none">
              + 1 MAINFRAME
            </div>
          </div>
        </div>
      </div>

      {/* Functional settings — host can edit, others view-only. */}
      <div
        className={`grid grid-cols-1 md:grid-cols-2 gap-5 mt-2 ${settingsLocked ? 'opacity-70 pointer-events-none' : ''}`}
      >
        {/* CATEGORIES (multi-select) */}
        <div>
          <div className="font-pixel text-xs text-zinc-400 mb-3 flex items-center gap-2">
            <span style={{ color: C.pink }}>▸</span>
            CATEGORIES
            <span style={{ color: C.pink }}>[{settings.categories.length}/4]</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {CATEGORY_OPTIONS.map((cat) => {
              const active = settings.categories.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className="font-pixel text-[10px] p-3 transition-all flex items-center gap-2 border-2 text-left"
                  style={{
                    borderColor: active ? cat.color : '#27272a',
                    background: active ? `${cat.color}1a` : 'transparent',
                    color: active ? cat.color : '#52525b',
                    boxShadow: active
                      ? `0 0 14px ${cat.color}66, inset 0 0 14px ${cat.color}33`
                      : 'none',
                  }}
                >
                  <cat.Icon size={18} />
                  <span className="leading-tight">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* DIFFICULTY (top) + RPG character placeholder (bottom) */}
        <div className="space-y-4 flex flex-col">
          <div>
            <div className="font-pixel text-xs text-zinc-400 mb-3 flex items-center gap-2">
              <span style={{ color: C.yellow }}>▸</span>DIFFICULTY
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {DIFFICULTY_OPTIONS.map((d) => {
                const on = settings.difficulty === d.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDifficulty(d.id)}
                    className="font-pixel text-[10px] p-3 transition-all border-2 text-left"
                    style={{
                      borderColor: on ? d.color : '#27272a',
                      background: on ? `${d.color}1a` : 'transparent',
                      color: on ? d.color : '#52525b',
                      boxShadow: on
                        ? `0 0 14px ${d.color}66, inset 0 0 10px ${d.color}33`
                        : 'none',
                    }}
                  >
                    <div>{d.label}</div>
                    <div className="font-crt text-sm opacity-70 mt-0.5">{d.sub}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reserved space for v3 Quest-Mode character panel. */}
          <div className="flex-1 border-2 border-dashed border-zinc-800 p-4 flex flex-col items-center justify-center text-center gap-2 min-h-[120px]">
            <div className="font-pixel text-[9px] text-zinc-600">
              ▸ CHARACTER LOADOUT
            </div>
            <div
              className="font-pixel text-[8px]"
              style={{ color: C.purple }}
            >
              UNLOCKS IN QUEST MODE
            </div>
            <div className="font-crt text-base text-zinc-700 leading-tight px-2">
              class abilities · gear · streak relics
            </div>
          </div>
        </div>
      </div>

      {/* Start button — hidden when the floating HostAdminBar provides
          one (i.e. when meId is set, which means we're on the unified
          /play route with the admin bar mounted above). */}
      <div className="mt-auto pt-2">
        {error && (
          <div className="font-pixel text-xs text-center mb-2" style={{ color: C.red }}>
            ✗ {error}
          </div>
        )}
        {showStartButton && (
          <button
            onClick={handleStart}
            disabled={!canStart || isPending}
            className="btn-3d font-pixel text-base sm:text-xl w-full py-5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              color: C.green,
              background: '#0a0a0a',
              border: 'none',
            }}
          >
            <span className="flex items-center justify-center gap-3">
              <Power size={22} className={isPending ? 'warning-pulse' : ''} />
              {isPending
                ? 'INITIALIZING…'
                : players.length < 2
                  ? 'WAITING FOR PLAYERS…'
                  : 'INITIATE BROADCAST'}
              <ChevronRight size={22} />
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
