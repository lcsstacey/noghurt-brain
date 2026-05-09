import { Brain, Cpu, Flame, Ghost, Skull, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { PlayerColor } from '@/lib/types';

/**
 * Per-color default icon. Matches the prototype's PLAYERS_INIT mapping.
 * Future v1.5+ could let players pick their own; for v1 the color is
 * the only customization and the icon comes for the ride.
 */
export const COLOR_ICON: Record<PlayerColor, LucideIcon> = {
  pink: Brain,
  cyan: Skull,
  green: Cpu,
  yellow: Zap,
  red: Flame,
  purple: Ghost,
};

export type PlayerRowLike = {
  id: string;
  name: string;
  color: string;
};

/**
 * Maps a DB players row into the shape PlayerAvatar expects.
 */
export function toPlayer(row: PlayerRowLike) {
  const color = row.color as PlayerColor;
  return {
    id: row.id,
    name: row.name,
    color,
    Icon: COLOR_ICON[color] ?? Brain,
  };
}
