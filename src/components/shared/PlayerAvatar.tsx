import { Lock } from 'lucide-react';
import { C } from '@/styles/palette';
import type { Player } from '@/lib/types';

type PlayerAvatarProps = {
  player: Player;
  size?: number;
  showName?: boolean;
  locked?: boolean;
  glow?: boolean;
  dim?: boolean;
};

export function PlayerAvatar({
  player,
  size = 64,
  showName = true,
  locked = false,
  glow = true,
  dim = false,
}: PlayerAvatarProps) {
  const Icon = player.Icon;
  const color = C[player.color];

  return (
    <div className="flex flex-col items-center gap-1.5 transition-all">
      <div
        className={`relative grid place-items-center rounded transition-all ${dim ? 'opacity-30 grayscale' : ''}`}
        style={{
          width: size,
          height: size,
          color,
          background: '#000',
          boxShadow: glow ? `0 0 0 3px ${color}, 0 0 18px ${color}` : `0 0 0 3px ${color}`,
        }}
      >
        <Icon
          size={size * 0.5}
          strokeWidth={2.5}
          style={{ color, filter: `drop-shadow(0 0 4px ${color})` }}
        />
        {locked && (
          <div className="absolute inset-0 grid place-items-center bg-black/70 rounded">
            <Lock
              size={size * 0.45}
              style={{ color, filter: `drop-shadow(0 0 6px ${color})` }}
            />
          </div>
        )}
      </div>
      {showName && (
        <div className="font-pixel text-[9px] text-glow-soft" style={{ color }}>
          {player.name}
        </div>
      )}
    </div>
  );
}
