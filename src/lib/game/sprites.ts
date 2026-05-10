import { C } from '@/styles/palette';

/**
 * Pixel sprite atlas for class portraits. Ported from
 * prototypes/noghurt-brain-quest-mode-v1_1.jsx (lines 102-192).
 *
 * Each sprite is a 12×12 grid of palette-indexed characters:
 *   '.' = transparent
 *   any other char = palette[char] hex color
 *
 * Skin / steel / shadow / white aren't in the production palette so
 * inlined here as sprite-local hex.
 */

const SKIN = '#f5d4ad';
const WHITE = '#e8e8e8';
const STEEL = '#9ca3af';
const SHADOW = '#1a1a2e';

export type SpriteData = {
  palette: Record<string, string>;
  grid: string[];
};

export const SPRITES: Record<string, SpriteData> = {
  // ORACLE — purple robes, starfire (also serves as the v3 NPC; players
  // who pick purple get this).
  oracle: {
    palette: {
      '#': '#0a0a0a',
      H: C.purple,
      h: '#7a1bb3',
      F: SKIN,
      B: WHITE,
      R: C.cyan,
      r: '#0099a8',
      S: C.yellow,
    },
    grid: [
      '.....S......',
      '....SH#.....',
      '...#HHH#....',
      '..#HHHHH#...',
      '.#HHHHHHH#..',
      '#HHHHHHHHH#.',
      '..#FFFFFF#..',
      '..#FBBBBF#..',
      '.#BBBBBBBB#.',
      '.#RRRRRRRR#.',
      '..RRRRRRRR..',
      '..R##..##R..',
    ],
  },

  // MAGE — pink robes, pointed hat
  mage: {
    palette: {
      '#': '#0a0a0a',
      H: C.pink,
      h: '#a01a5a',
      F: SKIN,
      R: C.pink,
      r: '#a01a5a',
      S: C.yellow,
    },
    grid: [
      '....SH......',
      '....HH#.....',
      '...#HHH#....',
      '..#HHHHH#...',
      '.#HHHHHHH#..',
      '...#FFFF#...',
      '...#F##F#...',
      '..#RRRRRR#..',
      '.#RRRRRRRR#.',
      '.#RRRRRRRR#.',
      '..RRRrrRRR..',
      '..R##..##R..',
    ],
  },

  // HACKER — cyan hood, dark jacket
  hacker: {
    palette: {
      '#': '#0a0a0a',
      H: C.cyan,
      h: '#0099a8',
      F: SKIN,
      J: SHADOW,
      j: '#000',
      G: C.green,
    },
    grid: [
      '...#HHHH#...',
      '..#HHHHHH#..',
      '.#HhhhhhhH#.',
      '#HhFFFFFFhH#',
      '#HhF#FF#FhH#',
      '.#HhFFFFhH#.',
      '..#HHHHHH#..',
      '..JJJJJJJJ..',
      '.JJJGJJJJJJ.',
      '.JJJJJJJJJJ.',
      '..JJJjjJJJ..',
      '..J##..##J..',
    ],
  },

  // BARD — green tunic, lute, feathered hat
  bard: {
    palette: {
      '#': '#0a0a0a',
      H: C.green,
      h: '#1aa00a',
      F: SKIN,
      V: '#a04020',
      v: '#6a2810',
      L: '#d4a050',
      S: C.yellow,
    },
    grid: [
      '...#HHHH#...',
      '..#HHHHHH#..',
      '.#HHHHHHHH#.',
      '...#FFFF#...',
      '...#F##F#...',
      '..#FFFFFF#..',
      '..VVVVVVVV..',
      '.VVVLLLLVVV.',
      '.VVLLLLLLVV.',
      '..VVLLLLVV..',
      '..VVvvvvVV..',
      '..V##..##V..',
    ],
  },

  // PALADIN — yellow helm, steel armor, sword
  paladin: {
    palette: {
      '#': '#0a0a0a',
      H: C.yellow,
      h: '#b39600',
      F: SKIN,
      A: STEEL,
      a: '#525c69',
      S: '#e8e8e8',
      G: C.cyan,
    },
    grid: [
      '...#HHHH#...',
      '..#HHHHHH#..',
      '.#HHHHHHHH#.',
      '.#HFFFFFFH#.',
      '.#HF#FF#FH#.',
      '..#HHHHHH#..',
      '.AAAAAAAAAA.',
      '.AAAGAAASSAA',
      '.AAaAAAA##S.',
      '.AAaAAAAS#S.',
      '..aAaaaaS...',
      '..a##..##...',
    ],
  },
};
