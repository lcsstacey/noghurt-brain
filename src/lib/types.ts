import type { LucideIcon } from 'lucide-react';

export type PlayerColor = 'pink' | 'cyan' | 'green' | 'yellow' | 'red' | 'purple';

export type Player = {
  id: string;
  name: string;
  color: PlayerColor;
  Icon: LucideIcon;
};
