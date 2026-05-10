'use client';

import { Lock } from 'lucide-react';
import { C } from '@/styles/palette';
import { PixelSprite } from '@/components/shared/PixelSprite';
import { PlayerAvatar } from '@/components/shared/PlayerAvatar';
import { classFor } from '@/lib/game/classes';
import type { Player } from '@/lib/types';

type PlayerCardProps = {
  player: Player;
  /** Pixel scale for the sprite. Default 5 → 60×60 image for a 12×12 sprite. */
  scale?: number;
  /** Show the locked-overlay treatment. */
  locked?: boolean;
  /** When true, a subtle bob animation plays. */
  bob?: boolean;
};

/**
 * Lobby-only character card: pixel-art class portrait + class label +
 * player name. Falls back to a Lucide-icon avatar for colors without a
 * sprite (currently red / BERSERKER).
 *
 * Other phases keep the compact <PlayerAvatar /> — this is purely for
 * the lobby's class-portrait moment.
 */
export function PlayerCard({ player, scale = 5, locked = false, bob = true }: PlayerCardProps) {
  const cls = classFor(player.color);
  const color = C[player.color];
  const hasSprite = cls.spriteId != null;

  return (
    <div className="flex flex-col items-center gap-1 min-w-[68px]">
      <div className={`relative ${bob ? 'idle-bob' : ''}`}>
        {hasSprite ? (
          <PixelSprite id={cls.spriteId!} scale={scale} glowColor={color} />
        ) : (
          <PlayerAvatar player={player} size={scale * 12} showName={false} glow />
        )}
        {locked && (
          <div className="absolute inset-0 grid place-items-center bg-black/70">
            <Lock
              size={scale * 4}
              style={{ color, filter: `drop-shadow(0 0 4px ${color})` }}
            />
          </div>
        )}
      </div>
      <div
        className="font-pixel text-[9px] mt-0.5 text-glow-soft"
        style={{ color }}
      >
        {cls.name}
      </div>
      <div className="font-pixel text-[8px] text-zinc-400">{player.name}</div>
    </div>
  );
}
