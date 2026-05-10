import type { LucideIcon } from 'lucide-react';
import type { Category } from '@/data/questions';

export type PlayerColor = 'pink' | 'cyan' | 'green' | 'yellow' | 'red' | 'purple';

export type Player = {
  id: string;
  name: string;
  color: PlayerColor;
  Icon: LucideIcon;
};

/**
 * Class for the lobby class portrait (purely cosmetic for v1.5; mechanics
 * land in v3 Quest Mode). Derived from PlayerColor — see src/lib/game/classes.ts.
 */
export type PlayerClass = 'MAGE' | 'HACKER' | 'BARD' | 'PALADIN' | 'BERSERKER' | 'ORACLE';

/**
 * Host-controlled room settings — what categories to draw from, how hard,
 * how many rounds. Stored as JSONB on rooms.settings.
 */
export type RoomSettings = {
  categories: Category[]; // at least 1
  difficulty: 'normal' | 'nightmare';
  rounds_count: number; // 3-7
};

export const DEFAULT_ROOM_SETTINGS: RoomSettings = {
  categories: ['science', 'internet', 'geography', 'retro'],
  difficulty: 'normal',
  rounds_count: 5,
};
