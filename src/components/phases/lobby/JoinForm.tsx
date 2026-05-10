'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Lock } from 'lucide-react';
import { C } from '@/styles/palette';
import { PlayerAvatar } from '@/components/shared/PlayerAvatar';
import { COLOR_ICON } from '@/lib/game/colorIcon';
import { joinRoom } from '@/lib/actions/joinRoom';
import { signInWithDiscord } from '@/lib/auth/signInDiscord';
import { useRoomChannel } from '@/lib/realtime/useRoomChannel';
import type { PlayerColor } from '@/lib/types';

const ALL_COLORS: PlayerColor[] = ['pink', 'cyan', 'green', 'yellow', 'red', 'purple'];

export type DiscordUserHint = {
  name: string;
  avatarUrl: string | null;
};

type JoinFormProps = {
  code: string;
  role: 'host' | 'player';
  /**
   * If the caller authed via Discord OAuth, this is their display name +
   * avatar. We use it to pre-fill the callsign field and to render a
   * "signed in as X" affordance so the OAuth round-trip feels like it
   * actually accomplished something (the bug it fixes: previously the
   * post-Discord redirect dropped you back on the same blank form with
   * zero feedback).
   */
  discordUser?: DiscordUserHint | null;
};

function suggestedCallsign(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, '')
    .trim()
    .slice(0, 12);
}

/**
 * Name + color picker, plus Discord OAuth alternative. Used by both
 * /host/[code] and /play/[code] when the caller hasn't joined yet.
 *
 * Color picker greys out colors already claimed (live via useRoomChannel).
 * Discord users get the OAuth-confirmation banner + name pre-fill.
 */
export function JoinForm({ code, role, discordUser }: JoinFormProps) {
  const router = useRouter();
  const { players } = useRoomChannel(code);
  const [name, setName] = useState(discordUser ? suggestedCallsign(discordUser.name) : '');
  const [color, setColor] = useState<PlayerColor | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const takenColors = new Set(players.map((p) => p.color));
  const nameValid = name.trim().length >= 1 && name.trim().length <= 12;
  const canSubmit = nameValid && color != null && !takenColors.has(color);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || color == null) return;
    setError(null);
    startTransition(async () => {
      const result = await joinRoom({
        code,
        name: name.trim().toUpperCase(),
        color,
        asHost: role === 'host',
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden scanlines vignette p-6"
      style={{ backgroundColor: C.bg }}
    >
      <div className="bg-grid absolute inset-0 opacity-50" />
      <div className="scan-line" />

      <div className="relative z-10 max-w-sm mx-auto flex flex-col gap-6 pt-6">
        <div className="text-center">
          <div className="font-pixel text-[10px] text-zinc-500 mb-2">
            <span className="blink" style={{ color: C.green }} aria-hidden>
              ▓
            </span>{' '}
            ROOM <span style={{ color: C.yellow }}>{code}</span>
          </div>
          <h1
            className="font-pixel text-2xl glitch-slow"
            style={{ color: role === 'host' ? C.pink : C.cyan }}
          >
            {role === 'host' ? 'HOST SETUP' : 'JOIN ROOM'}
          </h1>
        </div>

        {discordUser && (
          <div
            className="border-2 px-3 py-2 flex items-center gap-3"
            style={{
              borderColor: C.purple,
              background: `${C.purple}1a`,
              boxShadow: `0 0 12px ${C.purple}55`,
            }}
          >
            {discordUser.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={discordUser.avatarUrl}
                alt=""
                width={28}
                height={28}
                className="rounded-full border-2"
                style={{ borderColor: C.purple }}
              />
            ) : (
              <div
                className="w-7 h-7 grid place-items-center border-2 rounded-full"
                style={{ borderColor: C.purple, color: C.purple }}
              >
                <Check size={14} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-pixel text-[8px] text-zinc-400">
                ▸ DISCORD CONNECTED
              </div>
              <div
                className="font-pixel text-xs truncate text-glow-soft"
                style={{ color: C.purple }}
              >
                {discordUser.name}
              </div>
            </div>
            <Check size={16} style={{ color: C.green }} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label
              htmlFor="player-name"
              className="font-pixel text-[10px] text-zinc-400 mb-2 block"
            >
              <span style={{ color: C.green }}>▸</span> CALLSIGN
            </label>
            <input
              id="player-name"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 12))}
              maxLength={12}
              autoCapitalize="characters"
              spellCheck={false}
              autoFocus
              placeholder="ENTER NAME"
              className="font-pixel text-base w-full p-3 bg-black border-2 retro-input uppercase"
              style={{ borderColor: C.green, color: C.green }}
            />
          </div>

          <div>
            <div className="font-pixel text-[10px] text-zinc-400 mb-2">
              <span style={{ color: C.pink }}>▸</span> PICK A COLOR
            </div>
            <div className="grid grid-cols-3 gap-3">
              {ALL_COLORS.map((c) => {
                const Icon = COLOR_ICON[c];
                const taken = takenColors.has(c);
                const selected = color === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => !taken && setColor(c)}
                    disabled={taken}
                    aria-pressed={selected}
                    aria-label={`${c}${taken ? ' (taken)' : ''}`}
                    className="aspect-square grid place-items-center transition-all border-2 disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{
                      borderColor: selected ? C[c] : taken ? '#27272a' : C[c] + '88',
                      background: selected ? C[c] + '22' : 'transparent',
                      boxShadow: selected ? `0 0 12px ${C[c]}` : 'none',
                    }}
                  >
                    <Icon
                      size={28}
                      style={{
                        color: C[c],
                        filter: selected ? `drop-shadow(0 0 6px ${C[c]})` : undefined,
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {color && nameValid && (
            <div className="flex flex-col items-center gap-2 py-2">
              <div className="font-pixel text-[8px] text-zinc-500">PREVIEW</div>
              <PlayerAvatar
                player={{ id: 'preview', name: name.trim().toUpperCase(), color, Icon: COLOR_ICON[color] }}
                size={56}
              />
            </div>
          )}

          {error && (
            <div className="font-pixel text-xs text-center" style={{ color: C.red }}>
              ✗ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit || isPending}
            className="btn-3d font-pixel text-base w-full py-4 bg-black disabled:opacity-30"
            style={{ color: C.cyan }}
          >
            <span className="flex items-center justify-center gap-2">
              <Lock size={16} />
              {isPending ? 'CONNECTING…' : 'LOCK IN'}
            </span>
          </button>
        </form>

        {/* Discord OAuth — hidden when the caller already authed via Discord
            (banner above acknowledges the connection; they just need to pick
            a callsign and color to actually join). */}
        {!discordUser && (
          <>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-zinc-800" />
              <div className="font-pixel text-[8px] text-zinc-600">OR</div>
              <div className="flex-1 h-px bg-zinc-800" />
            </div>

            <form action={signInWithDiscord}>
              <input
                type="hidden"
                name="next"
                value={role === 'host' ? `/host/${code}` : `/play/${code}`}
              />
              <button
                type="submit"
                className="btn-3d font-pixel text-sm w-full py-3 bg-black"
                style={{ color: C.purple }}
              >
                SIGN IN WITH DISCORD
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
