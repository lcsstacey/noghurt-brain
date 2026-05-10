import { N, melodyDict, type Song } from './engine';

export type SongId = 'mainframe' | 'nightmare' | 'victory' | 'deeplink';

export const SONGS: Record<SongId, Song> = {
  // ─── CH 01 — MAINFRAME ───────────────────────────────────────
  mainframe: {
    id: 'mainframe',
    title: 'THE MAINFRAME',
    bpm: 100,
    bars: 8,
    progression: ['Am', 'F', 'C', 'G', 'Am', 'F', 'E', 'Am'],
    leadMode: 'classic',
    groove: 'classic',
    melody: melodyDict([
      [68,  N.A4, 1.0], [72, N.E5, 1.5], [78, N.D5, 0.5],
      [80,  N.C5, 1.0], [84, N.F5, 2.0], [92, N.E5, 1.0],
      [96,  N.D5, 0.5], [98, N.E5, 1.5], [104, N.C5, 0.5], [106, N.B4, 0.5], [110, N.Gs4, 0.5],
      [112, N.A4, 2.0], [120, N.C5, 0.5], [122, N.B4, 0.5], [124, N.A4, 1.0],
    ]),
    counter: melodyDict([
      [16, N.A3, 2.0],
      [40, N.C4, 2.0],
      [56, N.E4, 1.0], [60, N.G4, 1.0],
    ]),
  },

  // ─── CH 02 — NIGHTMARE PROTOCOL ──────────────────────────────
  nightmare: {
    id: 'nightmare',
    title: 'NIGHTMARE PROTOCOL',
    bpm: 128,
    bars: 8,
    progression: ['Dm', 'Bb', 'A7', 'Dm', 'Dm', 'Gm', 'A7', 'A7'],
    leadMode: 'dark',
    groove: 'driving',
    melody: melodyDict([
      [64, N.A4, 0.5], [66, N.D5, 0.5], [68, N.F5, 1.0], [72, N.E5, 0.5], [74, N.D5, 1.0],
      [80, N.G5, 0.5], [82, N.F5, 0.5], [84, N.Eb5, 0.5], [86, N.D5, 1.5],
      [96, N.Cs5, 0.5], [98, N.E5, 0.5], [100, N.D5, 0.5], [102, N.Cs5, 1.0], [108, N.A4, 1.0],
      [112, N.A4, 2.0],
    ]),
    counter: melodyDict([
      [0,  N.D4, 4.0],
      [32, N.Cs4, 2.0],
      [56, N.D5, 1.0], [60, N.A4, 1.0],
    ]),
  },

  // ─── CH 03 — VICTORY.EXE ─────────────────────────────────────
  victory: {
    id: 'victory',
    title: 'VICTORY.EXE',
    bpm: 132,
    bars: 8,
    progression: ['C', 'F', 'G', 'C', 'C', 'F', 'G', 'C'],
    leadMode: 'anthem',
    groove: 'anthem',
    melody: melodyDict([
      [64, N.C5, 1.0], [68, N.E5, 1.0], [72, N.G5, 1.0], [76, N.C6, 1.0],
      [80, N.A5, 0.5], [82, N.G5, 0.5], [84, N.F5, 1.0],
      [88, N.A5, 0.5], [90, N.G5, 0.5], [92, N.F5, 1.0],
      [96, N.D5, 0.5], [98, N.G5, 0.5], [100, N.D5, 0.5], [102, N.G5, 0.5],
      [104, N.D5, 1.0], [108, N.G4, 1.0],
      [112, N.C5, 0.5], [114, N.E5, 0.5], [116, N.G5, 0.5], [118, N.C6, 2.0],
    ]),
    counter: melodyDict([
      [0,  N.G4, 0.5], [4,  N.G4, 0.5], [8,  N.G4, 0.5], [12, N.G4, 0.5],
      [16, N.A4, 0.5], [20, N.A4, 0.5], [24, N.A4, 0.5], [28, N.A4, 0.5],
      [32, N.B4, 0.5], [36, N.B4, 0.5], [40, N.B4, 0.5], [44, N.D5, 0.5],
      [48, N.E5, 1.0], [52, N.G5, 1.0], [56, N.C5, 1.0], [60, N.G4, 1.0],
    ]),
  },

  // ─── CH 04 — DEEP_LINK (ambient) ─────────────────────────────
  deeplink: {
    id: 'deeplink',
    title: 'DEEP_LINK',
    bpm: 75,
    bars: 8,
    progression: ['Am', 'D', 'Am', 'D', 'F', 'C', 'G', 'Am'],
    leadMode: 'ambient',
    groove: 'ambient',
    melody: melodyDict([
      [66, N.F4, 1.5], [72, N.A4, 2.0],
      [80, N.E5, 2.0], [88, N.G5, 1.5], [94, N.E5, 0.5],
      [98, N.D5, 1.5], [104, N.B4, 1.0], [108, N.D5, 1.0],
      [112, N.A4, 4.0],
    ]),
    counter: melodyDict([
      [16, N.E4, 4.0],
      [40, N.Fs4, 2.0],
      [56, N.A4, 2.0],
    ]),
  },
};

/**
 * Map game phase to song. The MAINFRAME track plays through the lobby and
 * normal rounds (chill); NIGHTMARE PROTOCOL kicks in for the mainframe round
 * (intense); VICTORY.EXE plays the podium.
 */
export type GamePhase =
  | 'lobby'
  | 'intro'
  | 'question'
  | 'reveal'
  | 'mainframe_intro'
  | 'wager'
  | 'final_question'
  | 'final_reveal'
  | 'game_over';

export function songForPhase(phase: GamePhase): SongId {
  switch (phase) {
    case 'mainframe_intro':
    case 'wager':
    case 'final_question':
    case 'final_reveal':
      return 'nightmare';
    case 'game_over':
      return 'victory';
    default:
      return 'mainframe';
  }
}
