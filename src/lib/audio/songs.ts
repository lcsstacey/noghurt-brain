import { N, melodyDict, type Song } from './engine';

export type SongId = 'mainframe' | 'nightmare' | 'victory' | 'deeplink' | 'standby' | 'override';

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
      [112, N.A4, 2.0], [120, N.C5, 0.5], [122, N.B4, 0.5],
      // Final note extended past the 8-bar loop boundary so it crossfades
      // naturally with bar 1's attack on the next iteration.
      [124, N.A4, 3.0],
    ]),
    counter: melodyDict([
      [16, N.A3, 2.0],
      [40, N.C4, 2.0],
      [56, N.E4, 1.0], [60, N.G4, 1.0],
      // Loop-pickup: soft E4 + A3 in the last half-beat resolve into
      // bar 1's Am chord, bridging the loop seam.
      [126, N.E4, 1.0], [127, N.A3, 1.5],
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
      // Held A4 → Cs5 (leading-tone) → bridges into Dm of next loop.
      [112, N.A4, 2.0],
      [124, N.Cs5, 0.5], [126, N.A4, 2.5],
    ]),
    counter: melodyDict([
      [0,  N.D4, 4.0],
      [32, N.Cs4, 2.0],
      [56, N.D5, 1.0], [60, N.A4, 1.0],
      // Loop-pickup tension: held A3 over A7 → resolves to D drone of bar 1
      [120, N.A3, 2.5],
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
      [112, N.C5, 0.5], [114, N.E5, 0.5], [116, N.G5, 0.5],
      // Sustained C6 extended past loop boundary so it bleeds into bar 1.
      [118, N.C6, 3.0],
    ]),
    counter: melodyDict([
      [0,  N.G4, 0.5], [4,  N.G4, 0.5], [8,  N.G4, 0.5], [12, N.G4, 0.5],
      [16, N.A4, 0.5], [20, N.A4, 0.5], [24, N.A4, 0.5], [28, N.A4, 0.5],
      [32, N.B4, 0.5], [36, N.B4, 0.5], [40, N.B4, 0.5], [44, N.D5, 0.5],
      [48, N.E5, 1.0], [52, N.G5, 1.0], [56, N.C5, 1.0], [60, N.G4, 1.0],
      // Loop-pickup: G4 → C5 walk into bar 1's C major.
      [124, N.G4, 0.5], [126, N.C5, 1.5],
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
      // Sustained A4 whole-note resolution, extended past the loop so the
      // sine tail bleeds into the next iteration's heartbeat kick.
      [112, N.A4, 5.0],
    ]),
    counter: melodyDict([
      [16, N.E4, 4.0],
      [40, N.Fs4, 2.0],
      [56, N.A4, 2.0],
    ]),
  },

  // ─── CH 05 — STANDBY.SYS (lobby variant — chill anticipation) ────
  // Slower than MAINFRAME (88bpm vs 100), in the same A minor tonality
  // but with a lifted middle section (Dm) and a rising 4-bar pickup
  // counter that telegraphs the in-game theme without spoiling it.
  // Sparse melody — feels like waiting for friends to load in.
  standby: {
    id: 'standby',
    title: 'STANDBY.SYS',
    bpm: 88,
    bars: 8,
    progression: ['Am', 'F', 'C', 'G', 'Am', 'Dm', 'G', 'Am'],
    leadMode: 'classic',
    groove: 'classic',
    melody: melodyDict([
      // Bar 5 (Am): patient C5-A4-E5 statement
      [64, N.C5, 1.0], [68, N.A4, 1.0], [72, N.E5, 2.0],
      // Bar 6 (Dm): rise to F5, dwell
      [80, N.F5, 1.5], [86, N.D5, 0.5], [88, N.A4, 1.0],
      // Bar 7 (G): G4-B4-D5 ascending hook
      [96, N.G4, 0.5], [98, N.B4, 0.5], [100, N.D5, 1.0],
      [104, N.B4, 0.5], [106, N.D5, 0.5], [108, N.G4, 1.0],
      // Bar 8 (Am): resolve down to A4 — extended past loop boundary
      // so the lead bleeds into bar 1's Am attack on the next iteration.
      [112, N.E5, 1.0], [116, N.C5, 1.0], [120, N.A4, 3.5],
    ]),
    counter: melodyDict([
      // Bars 1-4: rising 4-bar pickup, one note per bar
      [0,  N.A3, 4.0],   // bar 1
      [16, N.C4, 4.0],   // bar 2 (over F)
      [32, N.E4, 4.0],   // bar 3 (over C)
      [48, N.G4, 2.0], [56, N.B4, 2.0],  // bar 4 (over G) — leading-tone walk into bar 5
      // Loop-pickup: gentle E4 → A3 walk into bar 1.
      [126, N.E4, 1.0], [127, N.A3, 1.5],
    ]),
  },

  // ─── CH 06 — OVERRIDE.SYS (mainframe in-game — driving intensity) ──
  // Faster than NIGHTMARE (140bpm vs 128), A minor with a chromatic Bb
  // surprise in bar 2/6 that shifts the floor under you. Driving 4-on-floor
  // but with the snare moved to "and of 2" / "and of 4" for half-time-feel
  // urgency. Melody rapid, more notes per bar than NIGHTMARE — the player
  // shouldn't get a moment to breathe while their wager is on the line.
  override: {
    id: 'override',
    title: 'OVERRIDE.SYS',
    bpm: 140,
    bars: 8,
    progression: ['Am', 'Bb', 'E', 'Am', 'Am', 'Dm', 'E', 'A7'],
    leadMode: 'dark',
    groove: 'driving',
    melody: melodyDict([
      // Bar 5 (Am): rapid climb
      [64, N.A4, 0.5], [66, N.C5, 0.5], [68, N.E5, 0.5], [70, N.A5, 1.0],
      [74, N.G5, 0.5], [76, N.E5, 1.0],
      // Bar 6 (Dm): F-D-A staccato pattern
      [80, N.F5, 0.5], [82, N.D5, 0.5], [84, N.A4, 0.5], [86, N.F5, 0.5],
      [88, N.D5, 1.0], [92, N.A4, 1.0],
      // Bar 7 (E): G#-E-B leading-tone, dwell on B4
      [96, N.Gs4, 0.5], [98, N.B4, 0.5], [100, N.E5, 1.0],
      [104, N.B4, 0.5], [106, N.Gs4, 0.5], [108, N.E4, 1.0],
      // Bar 8 (A7): G → E → C# → A descending pickup, last note extended
      // past loop boundary as a held A3 → bleeds into Am of next loop.
      [112, N.G4, 0.5], [114, N.E4, 0.5], [116, N.Cs4, 0.5], [118, N.A3, 3.0],
    ]),
    counter: melodyDict([
      [0,  N.A3, 4.0],    // bar 1: drone A3
      [16, N.Bb3, 2.0],   // bar 2: chromatic Bb tension
      [32, N.Gs3, 2.0],   // bar 3: leading tone
      [48, N.A3, 1.0], [52, N.E4, 1.0],  // bar 4: pickup before main melody
      // Loop-pickup: tense Cs4 → E4 leading tone over A7 → resolves to A3 drone of bar 1.
      [124, N.Cs4, 0.5], [126, N.E4, 1.5],
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
    // Lobby gets its own slower variant — chill anticipation, not the
    // signature in-game theme.
    case 'lobby':
      return 'standby';
    // Normal-round play (intro / question / reveal) is THE MAINFRAME —
    // the signature theme.
    case 'intro':
    case 'question':
    case 'reveal':
      return 'mainframe';
    // Mainframe round opens with NIGHTMARE PROTOCOL's cinematic
    // tension, then OVERRIDE.SYS during the wager + final question
    // for max in-game intensity.
    case 'mainframe_intro':
      return 'nightmare';
    case 'wager':
    case 'final_question':
    case 'final_reveal':
      return 'override';
    case 'game_over':
      return 'victory';
    default:
      return 'standby';
  }
}
