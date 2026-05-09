'use client';

import { useEffect, useState, useTransition } from 'react';
import QRCode from 'qrcode';
import { Atom, ChevronRight, Gamepad2, Globe, Power, Radio, Wifi } from 'lucide-react';
import { C } from '@/styles/palette';
import { PlayerAvatar } from '@/components/shared/PlayerAvatar';
import { useRoomChannel } from '@/lib/realtime/useRoomChannel';
import { startGame } from '@/lib/actions/startGame';
import { toPlayer } from '@/lib/game/colorIcon';

const V2_CATEGORIES = [
  { id: 'science', name: 'HARDCORE SCIENCE', Icon: Atom, color: C.cyan },
  { id: 'internet', name: 'INTERNET CULTURE', Icon: Wifi, color: C.pink },
  { id: 'geography', name: 'GEOGRAPHY', Icon: Globe, color: C.green },
  { id: 'retro', name: 'RETRO GAMING', Icon: Gamepad2, color: C.yellow },
];

const V2_DIFFICULTY = [
  { id: 'normal', label: 'NORMAL', color: C.green, sub: 'Standard timing' },
  { id: 'nightmare', label: 'NIGHTMARE', color: C.red, sub: 'Faster · Harder' },
];

type LobbyHostProps = {
  code: string;
  joinUrl: string;
};

/**
 * Host TV view of the lobby. Real-time player grid, room code,
 * QR code → /play/[code], and the INITIATE BROADCAST button.
 *
 * Categories / Difficulty / Rounds are visible but disabled — they're
 * v2-cut features per docs/MVP_SCOPE.md, surfaced as "V2" placeholders
 * to keep the prototype's visual rhythm.
 */
export function LobbyHost({ code, joinUrl }: LobbyHostProps) {
  const { players, status } = useRoomChannel(code);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    QRCode.toDataURL(joinUrl, {
      margin: 1,
      width: 110,
      color: { dark: '#000000', light: '#ffffff' },
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, [joinUrl]);

  const handleStart = () => {
    setError(null);
    startTransition(async () => {
      const result = await startGame(code);
      if (!result.ok) setError(result.error);
    });
  };

  const canStart = players.length >= 2 && status === 'subscribed';

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

      {/* Player grid */}
      <div>
        <div className="font-pixel text-xs text-zinc-400 mb-3 flex items-center gap-2">
          <span style={{ color: C.green }}>▸</span>
          PLAYERS CONNECTED{' '}
          <span style={{ color: C.green }}>[{players.length}/8]</span>
        </div>
        <div className="flex flex-wrap gap-5">
          {players.map((p, i) => (
            <div key={p.id} className="pixel-pop" style={{ animationDelay: `${i * 0.08}s` }}>
              <PlayerAvatar player={toPlayer(p)} size={68} />
            </div>
          ))}
          {Array.from({ length: 8 - players.length }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 opacity-30">
              <div className="w-[68px] h-[68px] border-2 border-dashed border-zinc-700 grid place-items-center font-pixel text-zinc-600">
                ?
              </div>
              <div className="font-pixel text-[9px] text-zinc-600">EMPTY</div>
            </div>
          ))}
        </div>
      </div>

      {/* v2 placeholder toggles — visually present, inert */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2 opacity-50 pointer-events-none flicker">
        <div>
          <div className="font-pixel text-xs text-zinc-500 mb-3 flex items-center gap-2">
            <span style={{ color: C.pink }}>▸</span>
            CATEGORIES
            <span
              className="font-pixel text-[8px] px-1.5 py-0.5 border ml-2"
              style={{ borderColor: C.purple, color: C.purple }}
            >
              V2
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {V2_CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                className="font-pixel text-[10px] p-3 flex items-center gap-2 border-2 text-left"
                style={{ borderColor: '#27272a', color: '#52525b' }}
              >
                <cat.Icon size={18} />
                <span className="leading-tight">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="font-pixel text-xs text-zinc-500 mb-3 flex items-center gap-2">
              <span style={{ color: C.yellow }}>▸</span>
              DIFFICULTY
              <span
                className="font-pixel text-[8px] px-1.5 py-0.5 border ml-2"
                style={{ borderColor: C.purple, color: C.purple }}
              >
                V2
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {V2_DIFFICULTY.map((d) => (
                <div
                  key={d.id}
                  className="font-pixel text-[10px] p-3 border-2 text-left"
                  style={{ borderColor: '#27272a', color: '#52525b' }}
                >
                  <div>{d.label}</div>
                  <div className="font-crt text-sm opacity-70 mt-0.5">{d.sub}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="font-pixel text-xs text-zinc-500 mb-3 flex items-center gap-2">
              <span style={{ color: C.cyan }}>▸</span>
              ROUNDS
              <span
                className="font-pixel text-[8px] px-1.5 py-0.5 border ml-2"
                style={{ borderColor: C.purple, color: C.purple }}
              >
                V2
              </span>
            </div>
            <div className="font-pixel text-3xl text-center text-glow" style={{ color: C.cyan }}>
              5
            </div>
            <div className="font-crt text-base mt-1.5 text-zinc-500 text-center">
              4 normal + 1 MAINFRAME
            </div>
          </div>
        </div>
      </div>

      {/* Start button */}
      <div className="mt-auto pt-2">
        {error && (
          <div className="font-pixel text-xs text-center mb-2" style={{ color: C.red }}>
            ✗ {error}
          </div>
        )}
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
      </div>
    </div>
  );
}
