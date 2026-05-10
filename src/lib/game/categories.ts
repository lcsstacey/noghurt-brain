import { Atom, Gamepad2, Globe, Wifi } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { C } from '@/styles/palette';
import type { Category } from '@/data/questions';

export type CategoryMeta = {
  id: Category;
  name: string;
  short: string;
  Icon: LucideIcon;
  color: string;
};

export const CATEGORIES: Record<Category, CategoryMeta> = {
  science: { id: 'science', name: 'HARDCORE SCIENCE', short: 'SCI', Icon: Atom, color: C.cyan },
  internet: { id: 'internet', name: 'INTERNET CULTURE', short: 'NET', Icon: Wifi, color: C.pink },
  geography: { id: 'geography', name: 'GEOGRAPHY', short: 'GEO', Icon: Globe, color: C.green },
  retro: { id: 'retro', name: 'RETRO GAMING', short: 'RETRO', Icon: Gamepad2, color: C.yellow },
  // History/pop_culture reserved for future expansion; fall back to science.
  history: { id: 'history', name: 'HISTORY', short: 'HIS', Icon: Atom, color: C.purple },
  pop_culture: { id: 'pop_culture', name: 'POP CULTURE', short: 'POP', Icon: Atom, color: C.red },
};
