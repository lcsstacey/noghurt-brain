import type { PlayerClass, PlayerColor } from '@/lib/types';

export type ClassMeta = {
  name: PlayerClass;
  /** Sprite id in src/lib/game/sprites.ts. null = no sprite, fall back to Lucide icon. */
  spriteId: string | null;
  tagline: string;
};

/**
 * Color → class lookup. Kept derivative (no DB column for class) since
 * v1.5 class is purely cosmetic — it shifts based on the player's color
 * choice. Future v3 Quest Mode can add real class persistence.
 */
export const CLASS_BY_COLOR: Record<PlayerColor, ClassMeta> = {
  pink:   { name: 'MAGE',      spriteId: 'mage',    tagline: 'Burst caster' },
  cyan:   { name: 'HACKER',    spriteId: 'hacker',  tagline: 'Decryptor' },
  green:  { name: 'BARD',      spriteId: 'bard',    tagline: 'Support' },
  yellow: { name: 'PALADIN',   spriteId: 'paladin', tagline: 'Tank' },
  purple: { name: 'ORACLE',    spriteId: 'oracle',  tagline: 'Seer' },
  red:    { name: 'BERSERKER', spriteId: null,      tagline: 'Reckless' },
};

export function classFor(color: PlayerColor): ClassMeta {
  return CLASS_BY_COLOR[color];
}
