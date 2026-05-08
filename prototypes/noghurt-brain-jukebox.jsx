import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Disc3, Radio, Music, Skull, Crown, Brain, Cpu } from 'lucide-react';

// ════════════════════════════════════════════════════════════════
// PALETTE & STYLES
// ════════════════════════════════════════════════════════════════

const C = {
  pink: '#ff2e88', cyan: '#00f0ff', green: '#39ff14',
  yellow: '#ffe600', red: '#ff0040', purple: '#b829ff',
};

const InjectedStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap');
    .font-pixel { font-family: 'Press Start 2P', ui-monospace, monospace; letter-spacing: 0.04em; }
    .font-crt { font-family: 'VT323', 'Courier New', monospace; letter-spacing: 0.02em; }
    .bg-grid {
      background-image:
        linear-gradient(rgba(255, 46, 136, 0.06) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 240, 255, 0.06) 1px, transparent 1px);
      background-size: 28px 28px;
    }
    .scanlines::after {
      content: ''; position: absolute; inset: 0;
      background: repeating-linear-gradient(0deg, rgba(0,0,0,0.28) 0px, rgba(0,0,0,0.28) 1px, transparent 1px, transparent 3px);
      pointer-events: none; z-index: 30; mix-blend-mode: multiply;
    }
    .text-glow { text-shadow: 0 0 6px currentColor, 0 0 14px currentColor; }
    .text-glow-soft { text-shadow: 0 0 4px currentColor; }
    @keyframes glitchAnim {
      0%,100% { transform: translate(0); text-shadow: 0 0 0 currentColor; }
      20% { transform: translate(-1px, 1px); text-shadow: 3px 0 #ff2e88, -3px 0 #00f0ff; }
      40% { transform: translate(-1px,-1px); text-shadow: -3px 0 #ff2e88, 3px 0 #00f0ff; }
      60% { transform: translate(1px, 1px); text-shadow: 3px 0 #00f0ff, -3px 0 #ff2e88; }
      80% { transform: translate(1px,-1px); text-shadow: -3px 0 #00f0ff, 3px 0 #ff2e88; }
    }
    .glitch-slow { animation: glitchAnim 2s infinite; }
    @keyframes blinkAnim { 0%,55% { opacity: 1; } 56%,100% { opacity: 0; } }
    .blink { animation: blinkAnim 1.1s infinite; }
    @keyframes scanLineMove {
      0% { transform: translateY(-30%); }
      100% { transform: translateY(130%); }
    }
    .scan-line {
      position: absolute; left: 0; right: 0; height: 8px;
      background: linear-gradient(180deg, transparent, rgba(0,240,255,0.35), transparent);
      animation: scanLineMove 5s linear infinite;
      pointer-events: none; z-index: 32;
    }
    @keyframes neonPulse {
      0%,100% { box-shadow: 0 0 6px currentColor, 0 0 14px currentColor; }
      50% { box-shadow: 0 0 16px currentColor, 0 0 30px currentColor; }
    }
    .neon-pulse { animation: neonPulse 1.4s ease-in-out infinite; }
    @keyframes beatPulse {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.4); opacity: 0.7; }
      100% { transform: scale(1); opacity: 1; }
    }
    .beat-pulse { animation: beatPulse 0.15s ease-out; }
    .btn-3d {
      transition: transform 0.08s, box-shadow 0.08s;
      box-shadow: 0 6px 0 0 rgba(0,0,0,0.85), 0 0 0 3px currentColor;
    }
    .btn-3d:active:not(:disabled) {
      transform: translateY(4px);
      box-shadow: 0 2px 0 0 rgba(0,0,0,0.85), 0 0 0 3px currentColor;
    }
    @keyframes warningPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
    .warning-pulse { animation: warningPulse 0.4s infinite; }
    @keyframes slideInUp {
      0% { transform: translateY(10px); opacity: 0; }
      100% { transform: translateY(0); opacity: 1; }
    }
    .slide-up { animation: slideInUp 0.3s ease-out backwards; }
  `}</style>
);

// ════════════════════════════════════════════════════════════════
// TIMING + NOTE HELPERS
// ════════════════════════════════════════════════════════════════

const STEPS_PER_BEAT = 4; // 16th-note resolution
const STEPS_PER_BAR = STEPS_PER_BEAT * 4;

const f = (n) => 440 * Math.pow(2, (n - 69) / 12);
const N = {
  A1: 33, Bb1: 34, C2: 36, D2: 38, E2: 40, F2: 41, G2: 43, A2: 45, Bb2: 46, B2: 47,
  C3: 48, D3: 50, Eb3: 51, E3: 52, F3: 53, Fs3: 54, G3: 55, Gs3: 56, A3: 57, Bb3: 58, B3: 59,
  C4: 60, Cs4: 61, D4: 62, Eb4: 63, E4: 64, F4: 65, Fs4: 66, G4: 67, Gs4: 68, A4: 69, Bb4: 70, B4: 71,
  C5: 72, Cs5: 73, D5: 74, Eb5: 75, E5: 76, F5: 77, Fs5: 78, G5: 79, Gs5: 80, A5: 81, Bb5: 82, B5: 83, C6: 84,
};

// Chord library — used across all songs
const ROOT = {
  Am: N.A2, F: N.F2, C: N.C3, G: N.G2, E: N.E2,
  Dm: N.D2, Bb: N.Bb2, A7: N.A2, Gm: N.G2,
  D: N.D3,
};

const TRIAD = {
  Am: [N.A3, N.C4, N.E4],
  F:  [N.F3, N.A3, N.C4],
  C:  [N.C4, N.E4, N.G4],
  G:  [N.G3, N.B3, N.D4],
  E:  [N.E3, N.Gs3, N.B3],
  Dm: [N.D3, N.F3, N.A3],
  Bb: [N.Bb3, N.D4, N.F4],
  A7: [N.A3, N.Cs4, N.E4, N.G4],
  Gm: [N.G3, N.Bb3, N.D4],
  D:  [N.D3, N.Fs3, N.A3],
};

// 8 8th-note arpeggios per bar (UP-DOWN-UP-DOWN of the triad)
const ARP = {
  Am: [N.A3, N.C4, N.E4, N.C4, N.A3, N.C4, N.E4, N.C4],
  F:  [N.F3, N.A3, N.C4, N.A3, N.F3, N.A3, N.C4, N.A3],
  C:  [N.C4, N.E4, N.G4, N.E4, N.C4, N.E4, N.G4, N.E4],
  G:  [N.G3, N.B3, N.D4, N.B3, N.G3, N.B3, N.D4, N.B3],
  E:  [N.E3, N.Gs3, N.B3, N.Gs3, N.E3, N.Gs3, N.B3, N.Gs3],
  Dm: [N.D3, N.F3, N.A3, N.F3, N.D3, N.F3, N.A3, N.F3],
  Bb: [N.Bb3, N.D4, N.F4, N.D4, N.Bb3, N.D4, N.F4, N.D4],
  A7: [N.A3, N.Cs4, N.E4, N.G4, N.E4, N.Cs4, N.A3, N.Cs4],
  Gm: [N.G3, N.Bb3, N.D4, N.Bb3, N.G3, N.Bb3, N.D4, N.Bb3],
  D:  [N.D3, N.Fs3, N.A3, N.Fs3, N.D3, N.Fs3, N.A3, N.Fs3],
};

// ════════════════════════════════════════════════════════════════
// SONGS
// ════════════════════════════════════════════════════════════════

const melodyDict = (raw) => {
  const out = {};
  for (const [step, pitch, dur] of raw) {
    if (!out[step]) out[step] = [];
    out[step].push({ pitch, dur });
  }
  return out;
};

const SONGS = {
  // ─────────── CH 01 ───────────
  mainframe: {
    id: 'mainframe',
    channel: '01',
    title: 'THE MAINFRAME',
    subtitle: 'MAIN THEME',
    use: 'Lobby · Boot · Idle',
    accent: C.cyan,
    Icon: Brain,
    bpm: 100,
    bars: 8,
    keyName: 'A MINOR',
    progression: ['Am', 'F', 'C', 'G', 'Am', 'F', 'E', 'Am'],
    leadMode: 'classic',
    groove: 'classic',
    description: 'A minor synthwave with patient form — bars 1-4 breathe (bass + arp + a single climbing counter-melody note), bars 5-8 carry the hook. The melody leaps a perfect fifth (A4 → E5), dwells, leaps again to F5 (the peak), then in bar 7 ASCENDS back to E5 instead of walking down a third time — the motivic recall that breaks contour fatigue. Resolves through a Gs4 leading tone over the E7 chord into a closing turn around A4.',
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

  // ─────────── CH 02 ───────────
  nightmare: {
    id: 'nightmare',
    channel: '02',
    title: 'NIGHTMARE PROTOCOL',
    subtitle: 'TENSION MODE',
    use: 'Nightmare difficulty · Final round',
    accent: C.red,
    Icon: Skull,
    bpm: 128,
    bars: 8,
    keyName: 'D MINOR · HARMONIC',
    progression: ['Dm', 'Bb', 'A7', 'Dm', 'Dm', 'Gm', 'A7', 'A7'],
    leadMode: 'dark',
    groove: 'driving',
    description: 'D harmonic minor with the A7 dominant grinding the leading tone (C#) into your skull. Four-on-the-floor kick, 16th-note hi-hats, octave-pumping bass. The melody descends chromatically through Eb5 (the b6 — that\'s the dread note) and the loop never resolves — bar 8 sits on A7 unresolved, dangling you back to bar 1. This is what plays while the timer counts down.',
    melody: melodyDict([
      // Bar 5 (Dm): rapid staccato climb to F5, fall back
      [64, N.A4, 0.5], [66, N.D5, 0.5], [68, N.F5, 1.0], [72, N.E5, 0.5], [74, N.D5, 1.0],
      // Bar 6 (Gm): chromatic descent w/ Eb5 dissonance
      [80, N.G5, 0.5], [82, N.F5, 0.5], [84, N.Eb5, 0.5], [86, N.D5, 1.5],
      // Bar 7 (A7): leading-tone bouncing — C#5 won't let go
      [96, N.Cs5, 0.5], [98, N.E5, 0.5], [100, N.D5, 0.5], [102, N.Cs5, 1.0], [108, N.A4, 1.0],
      // Bar 8 (A7): held A4 then SILENCE — leaves you hanging
      [112, N.A4, 2.0],
      // beats 3-4: deliberate rest
    ]),
    counter: melodyDict([
      [0,  N.D4, 4.0],   // bar 1: drone D4
      [32, N.Cs4, 2.0],  // bar 3: leading tone telegraphs the A7 to come
      [56, N.D5, 1.0], [60, N.A4, 1.0], // bar 4: aggressive pickup
    ]),
  },

  // ─────────── CH 03 ───────────
  victory: {
    id: 'victory',
    channel: '03',
    title: 'VICTORY.EXE',
    subtitle: 'CHAMPION FANFARE',
    use: 'Win screen · Game over',
    accent: C.yellow,
    Icon: Crown,
    bpm: 132,
    bars: 8,
    keyName: 'C MAJOR',
    progression: ['C', 'F', 'G', 'C', 'C', 'F', 'G', 'C'],
    leadMode: 'anthem',
    groove: 'anthem',
    description: 'C major I-IV-V-I — the most triumphant 4 chords in pop music. Triple-detuned squares (no vibrato — confidence, not vulnerability), bright filter, dotted-rhythm bass on beats 1/2.5/3/4.5. The hook is a heroic rising arpeggio C-E-G-C6, then a descending lick over F (A-G-F twice), an octave-bouncing fanfare over G (D5-G5-D5-G5), landing on a high C6. This is what plays when someone slams a Mainframe wager and wins.',
    melody: melodyDict([
      // Bar 5 (C): rising heroic arpeggio
      [64, N.C5, 1.0], [68, N.E5, 1.0], [72, N.G5, 1.0], [76, N.C6, 1.0],
      // Bar 6 (F): descending lick repeated — the signature
      [80, N.A5, 0.5], [82, N.G5, 0.5], [84, N.F5, 1.0],
      [88, N.A5, 0.5], [90, N.G5, 0.5], [92, N.F5, 1.0],
      // Bar 7 (G): octave fanfare bouncing
      [96, N.D5, 0.5], [98, N.G5, 0.5], [100, N.D5, 0.5], [102, N.G5, 0.5],
      [104, N.D5, 1.0], [108, N.G4, 1.0],
      // Bar 8 (C): triumphant resolution to high C6
      [112, N.C5, 0.5], [114, N.E5, 0.5], [116, N.G5, 0.5], [118, N.C6, 2.0],
    ]),
    counter: melodyDict([
      // Bars 1-4 stab the chord tones — anthem build
      [0,  N.G4, 0.5], [4,  N.G4, 0.5], [8,  N.G4, 0.5], [12, N.G4, 0.5],
      [16, N.A4, 0.5], [20, N.A4, 0.5], [24, N.A4, 0.5], [28, N.A4, 0.5],
      [32, N.B4, 0.5], [36, N.B4, 0.5], [40, N.B4, 0.5], [44, N.D5, 0.5],
      [48, N.E5, 1.0], [52, N.G5, 1.0], [56, N.C5, 1.0], [60, N.G4, 1.0], // pickup into hook
    ]),
  },

  // ─────────── CH 04 ───────────
  deeplink: {
    id: 'deeplink',
    channel: '04',
    title: 'DEEP_LINK',
    subtitle: 'AMBIENT CHANNEL',
    use: 'Daily Mainframe · Solo · Settings',
    accent: C.purple,
    Icon: Cpu,
    bpm: 75,
    bars: 8,
    keyName: 'A DORIAN',
    progression: ['Am', 'D', 'Am', 'D', 'F', 'C', 'G', 'Am'],
    leadMode: 'ambient',
    groove: 'ambient',
    description: 'Aria Math territory. A Dorian — the diagnostic interval is the F# in the D chord (bars 2 and 4), that\'s the modal color you can\'t get in plain A minor. Pure sine + triangle leads, slow attacks measured in tenths of a second, very long reverb tails, no drums except a single soft kick at the loop start (the heartbeat). Sparse melody — every note has space to breathe. Plays when you\'re alone with the Daily Mainframe, contemplating your one shot at the leaderboard.',
    melody: melodyDict([
      // Bar 5 (F): hesitant low entry on F4, rise to A4
      [66, N.F4, 1.5], [72, N.A4, 2.0],
      // Bar 6 (C): rise to E5, then G5 peak
      [80, N.E5, 2.0], [88, N.G5, 1.5], [94, N.E5, 0.5],
      // Bar 7 (G): D5 sustained, B4 drop, D5 lift
      [98, N.D5, 1.5], [104, N.B4, 1.0], [108, N.D5, 1.0],
      // Bar 8 (Am): A4 whole-note resolution — meditation
      [112, N.A4, 4.0],
    ]),
    counter: melodyDict([
      [16, N.E4, 4.0],   // bar 2: held E4 over D chord (tension — E4 is the 9th of D)
      [40, N.Fs4, 2.0],  // bar 3 beat 3: F#4 — the dorian moment
      [56, N.A4, 2.0],   // bar 4 beat 3: A4 pickup into the melody
    ]),
  },
};

// ════════════════════════════════════════════════════════════════
// GROOVES (rhythm/pattern presets)
// ════════════════════════════════════════════════════════════════

const GROOVES = {
  // CLASSIC: Mainframe — bass on 1+3, kick on 1+3, snare on 2+4, 8th hats, 8th arp
  classic: {
    bass:   (s) => s === 0 || s === 8,
    bassDur: 1.75,
    sub:    (s, b) => s === 0 && (b % 2 === 0),
    kick:   (s) => s === 0 || s === 8,
    snare:  (s) => s === 4 || s === 12,
    hat:    (s) => s % 2 === 0,
    hatOpen: (s, b) => s === 6 && b === 7,
    arp:    (s) => s % 2 === 0,
    arpIdx: (s) => Math.floor(s / 2),
    pad:    (s) => s === 0,
    turnaround: (s, b) => s === 14 && b === 7,
    arpVol: 1,
  },

  // DRIVING: Nightmare — 4-on-floor kick + bass, 16th hats, faster arp
  driving: {
    bass:   (s) => s % 4 === 0,
    bassDur: 0.95,
    sub:    (s, b) => s === 0,
    kick:   (s) => s % 4 === 0,
    snare:  (s) => s === 4 || s === 12,
    hat:    (s) => s % 2 === 0,
    hatOpen: (s, b) => s === 14 && b === 3,
    arp:    (s) => s % 2 === 0,
    arpIdx: (s) => Math.floor(s / 2),
    pad:    (s) => s === 0,
    turnaround: (s, b) => (b === 3 || b === 7) && s === 14,
    arpVol: 0.9,
  },

  // ANTHEM: Victory — dotted bass, triumphant feel, snare rolls into bar 1
  anthem: {
    bass:   (s) => s === 0 || s === 6 || s === 8 || s === 14,
    bassDur: 1.5,
    sub:    (s, b) => s === 0,
    kick:   (s) => s === 0 || s === 8 || (s === 14 && true),
    snare:  (s) => s === 4 || s === 12 || s === 14, // extra snare hit on "and of 4" = anthem ghost
    hat:    (s) => s % 2 === 0,
    hatOpen: (s, b) => s === 6 || (s === 14 && b === 7),
    arp:    (s) => s % 2 === 0,
    arpIdx: (s) => Math.floor(s / 2),
    pad:    (s) => s === 0,
    turnaround: (s, b) => b === 7 && (s === 13 || s === 14 || s === 15), // snare roll into loop
    arpVol: 0.85,
  },

  // AMBIENT: Deep_Link — almost no rhythm. Heartbeat kick, sparse arp.
  ambient: {
    bass:   (s) => s === 0,
    bassDur: 4.0,
    sub:    (s, b) => s === 0,
    kick:   (s, b) => s === 0 && b === 0, // single heartbeat per loop
    snare:  () => false,
    hat:    () => false,
    hatOpen: () => false,
    arp:    (s) => s === 0 || s === 8, // half-notes only, super sparse
    arpIdx: (s) => s === 0 ? 0 : 4,
    pad:    (s) => s === 0,
    turnaround: () => false,
    arpVol: 0.5,
  },
};

// ════════════════════════════════════════════════════════════════
// SYNTH ENGINE
// ════════════════════════════════════════════════════════════════

function makeAudio() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  const ctx = new Ctx();

  const master = ctx.createGain();
  master.gain.value = 0.45;

  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -18;
  comp.knee.value = 12;
  comp.ratio.value = 4;
  comp.attack.value = 0.005;
  comp.release.value = 0.15;

  const reverbSend = ctx.createGain();
  reverbSend.gain.value = 0.18;
  const delay = ctx.createDelay(1.0);
  delay.delayTime.value = 0.18;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.35;
  const reverbReturn = ctx.createGain();
  reverbReturn.gain.value = 0.35;
  delay.connect(feedback);
  feedback.connect(delay);
  reverbSend.connect(delay);
  delay.connect(reverbReturn);

  const analyser = ctx.createAnalyser();
  analyser.fftSize = 512;
  analyser.smoothingTimeConstant = 0.75;

  master.connect(comp);
  reverbReturn.connect(comp);
  comp.connect(analyser);
  analyser.connect(ctx.destination);

  return { ctx, master, reverbSend, analyser };
}

// LEAD — four distinct voicings, one per song
function vLead(audio, freq, time, dur, mode = 'classic') {
  const { ctx, master, reverbSend } = audio;

  if (mode === 'classic') {
    // MAINFRAME: square + sub-octave sine, delayed vibrato, attack pitch scoop
    const osc = ctx.createOscillator();
    const sub = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(freq * 0.985, time);
    osc.frequency.exponentialRampToValueAtTime(freq, time + 0.05);
    sub.type = 'sine';
    sub.frequency.setValueAtTime((freq / 2) * 0.985, time);
    sub.frequency.exponentialRampToValueAtTime(freq / 2, time + 0.05);

    filter.type = 'lowpass';
    filter.frequency.value = 2800;
    filter.Q.value = 3;

    lfo.frequency.value = 5.5;
    lfoGain.gain.setValueAtTime(0, time);
    lfoGain.gain.setValueAtTime(0, time + 0.12);
    lfoGain.gain.linearRampToValueAtTime(4.5, time + 0.32);
    lfo.connect(lfoGain).connect(osc.frequency);

    const peak = 0.075;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(peak, time + 0.018);
    gain.gain.exponentialRampToValueAtTime(peak * 0.6, time + 0.1);
    gain.gain.setValueAtTime(peak * 0.6, time + Math.max(0.1, dur - 0.1));
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

    const subGain = ctx.createGain();
    subGain.gain.value = 0.25;
    sub.connect(subGain).connect(filter);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    gain.connect(reverbSend);

    osc.start(time); sub.start(time); lfo.start(time);
    osc.stop(time + dur + 0.1); sub.stop(time + dur + 0.1); lfo.stop(time + dur + 0.1);
  }

  else if (mode === 'dark') {
    // NIGHTMARE: detuned saws, soft-clip distortion, low filter, faster nervous vibrato
    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    const shaper = ctx.createWaveShaper();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();

    // Soft-clip distortion curve
    const samples = 1024;
    const curve = new Float32Array(samples);
    const k = 8;
    for (let i = 0; i < samples; i++) {
      const x = (i * 2 / samples) - 1;
      curve[i] = (1 + k) * x / (1 + k * Math.abs(x));
    }
    shaper.curve = curve;
    shaper.oversample = '2x';

    o1.type = 'sawtooth';
    o2.type = 'sawtooth';
    o1.frequency.setValueAtTime(freq * 0.99, time);
    o1.frequency.exponentialRampToValueAtTime(freq, time + 0.04);
    o2.frequency.value = freq * 1.012;

    filter.type = 'lowpass';
    filter.frequency.value = 1500;
    filter.Q.value = 5;

    lfo.frequency.value = 7.5;
    lfoGain.gain.setValueAtTime(0, time);
    lfoGain.gain.setValueAtTime(0, time + 0.08);
    lfoGain.gain.linearRampToValueAtTime(7, time + 0.2);
    lfo.connect(lfoGain).connect(o1.frequency);

    const peak = 0.06;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(peak, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(peak * 0.55, time + 0.08);
    gain.gain.setValueAtTime(peak * 0.55, time + Math.max(0.08, dur - 0.05));
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

    o1.connect(filter); o2.connect(filter);
    filter.connect(shaper).connect(gain);
    gain.connect(master);
    gain.connect(reverbSend);

    o1.start(time); o2.start(time); lfo.start(time);
    o1.stop(time + dur + 0.05); o2.stop(time + dur + 0.05); lfo.stop(time + dur + 0.05);
  }

  else if (mode === 'anthem') {
    // VICTORY: triple-detuned squares + saw, bright filter, sharp attack, no vibrato
    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const o3 = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    o1.type = 'square';
    o2.type = 'square';
    o3.type = 'sawtooth';
    o1.frequency.value = freq;
    o2.frequency.value = freq * 1.005;
    o3.frequency.value = freq * 0.995;

    filter.type = 'lowpass';
    filter.frequency.value = 5500;
    filter.Q.value = 1;

    const peak = 0.075;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(peak, time + 0.005);
    gain.gain.linearRampToValueAtTime(peak * 0.65, time + 0.1);
    gain.gain.setValueAtTime(peak * 0.65, time + Math.max(0.1, dur - 0.05));
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

    const sawGain = ctx.createGain();
    sawGain.gain.value = 0.4;
    o3.connect(sawGain).connect(filter);
    o1.connect(filter); o2.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    gain.connect(reverbSend);

    o1.start(time); o2.start(time); o3.start(time);
    o1.stop(time + dur + 0.1); o2.stop(time + dur + 0.1); o3.stop(time + dur + 0.1);
  }

  else if (mode === 'ambient') {
    // DEEP_LINK: pure sine + triangle, slow attack, very long reverb send
    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const gain = ctx.createGain();

    o1.type = 'sine';
    o2.type = 'triangle';
    o1.frequency.value = freq;
    o2.frequency.value = freq;

    const peak = 0.065;
    const att = Math.min(0.18, dur * 0.25);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(peak, time + att);
    gain.gain.linearRampToValueAtTime(peak * 0.7, time + dur * 0.7);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

    const o2Gain = ctx.createGain();
    o2Gain.gain.value = 0.3;
    o2.connect(o2Gain).connect(gain);
    o1.connect(gain);
    gain.connect(master);

    // Heavier reverb send — ambient lives in the reverb
    const extraRev = ctx.createGain();
    extraRev.gain.value = 1.6;
    gain.connect(extraRev).connect(reverbSend);

    o1.start(time); o2.start(time);
    o1.stop(time + dur + 0.2); o2.stop(time + dur + 0.2);
  }
}

// COUNTER — same modes-aware logic, slightly softer
function vCounter(audio, freq, time, dur, mode = 'classic') {
  const { ctx, master, reverbSend } = audio;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  if (mode === 'dark') {
    osc.type = 'sawtooth';
    filter.frequency.value = 1100;
  } else if (mode === 'anthem') {
    osc.type = 'square';
    filter.frequency.value = 4000;
  } else if (mode === 'ambient') {
    osc.type = 'sine';
    filter.frequency.value = 3000;
  } else {
    osc.type = 'triangle';
    filter.frequency.value = 1800;
  }
  osc.frequency.value = freq;
  filter.type = 'lowpass';

  const peak = mode === 'anthem' ? 0.06 : 0.04;
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(peak, time + (mode === 'ambient' ? 0.12 : 0.04));
  gain.gain.linearRampToValueAtTime(peak * 0.4, time + dur * 0.6);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

  osc.connect(filter).connect(gain);
  gain.connect(master);
  gain.connect(reverbSend);
  osc.start(time);
  osc.stop(time + dur + 0.05);
}

// BASS — fat detuned saws (consistent across songs, just dur changes)
function vBass(audio, freq, time, dur) {
  const { ctx, master } = audio;
  const o1 = ctx.createOscillator();
  const o2 = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  o1.type = 'sawtooth'; o2.type = 'sawtooth';
  o1.frequency.value = freq;
  o2.frequency.value = freq * 1.006;

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(900, time);
  filter.frequency.exponentialRampToValueAtTime(450, time + 0.15);
  filter.Q.value = 1.5;

  const peak = 0.13;
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(peak, time + 0.008);
  gain.gain.exponentialRampToValueAtTime(peak * 0.5, time + 0.12);
  gain.gain.setValueAtTime(peak * 0.5, time + Math.max(0.12, dur - 0.05));
  gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

  o1.connect(filter); o2.connect(filter);
  filter.connect(gain).connect(master);
  o1.start(time); o2.start(time);
  o1.stop(time + dur + 0.05); o2.stop(time + dur + 0.05);
}

function vSub(audio, freq, time, dur) {
  const { ctx, master } = audio;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq / 2;
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(0.18, time + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);
  osc.connect(gain).connect(master);
  osc.start(time);
  osc.stop(time + dur + 0.05);
}

function vArp(audio, freq, time, vol = 1) {
  const { ctx, master, reverbSend } = audio;
  const dur = 0.14;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  osc.type = 'square';
  osc.frequency.value = freq;
  filter.type = 'lowpass';
  filter.frequency.value = 3200;

  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(0.04 * vol, time + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

  osc.connect(filter).connect(gain);
  gain.connect(master);
  gain.connect(reverbSend);
  osc.start(time);
  osc.stop(time + dur + 0.02);
}

function vPad(audio, freq, time, dur, mode) {
  const { ctx, master, reverbSend } = audio;
  const osc = ctx.createOscillator();
  const detuneOsc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'triangle';
  osc.frequency.value = freq;
  detuneOsc.type = 'triangle';
  detuneOsc.frequency.value = freq * 1.003;

  filter.type = 'lowpass';
  filter.frequency.value = mode === 'dark' ? 800 : mode === 'ambient' ? 900 : 1200;

  const peak = mode === 'ambient' ? 0.03 : 0.022;
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.linearRampToValueAtTime(peak, time + 0.4);
  gain.gain.linearRampToValueAtTime(peak * 0.85, time + dur * 0.7);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

  osc.connect(filter); detuneOsc.connect(filter);
  filter.connect(gain);
  gain.connect(master);
  // Ambient pad gets extra reverb
  if (mode === 'ambient') {
    const extra = ctx.createGain();
    extra.gain.value = 1.4;
    gain.connect(extra).connect(reverbSend);
  } else {
    gain.connect(reverbSend);
  }
  osc.start(time); detuneOsc.start(time);
  osc.stop(time + dur + 0.1);
  detuneOsc.stop(time + dur + 0.1);
}

function vKick(audio, time, vol = 1) {
  const { ctx, master } = audio;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(140, time);
  osc.frequency.exponentialRampToValueAtTime(40, time + 0.1);
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(0.32 * vol, time + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.15);
  osc.connect(gain).connect(master);
  osc.start(time);
  osc.stop(time + 0.18);
}

function vSnare(audio, time, vol = 1) {
  const { ctx, master } = audio;
  const dur = 0.13;
  const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2);
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'highpass';
  noiseFilter.frequency.value = 1500;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.12 * vol, time);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

  const body = ctx.createOscillator();
  body.type = 'triangle';
  body.frequency.setValueAtTime(220, time);
  body.frequency.exponentialRampToValueAtTime(120, time + 0.04);
  const bodyGain = ctx.createGain();
  bodyGain.gain.setValueAtTime(0.06 * vol, time);
  bodyGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);

  src.connect(noiseFilter).connect(noiseGain).connect(master);
  body.connect(bodyGain).connect(master);
  src.start(time);
  body.start(time);
  body.stop(time + 0.06);
}

function vHat(audio, time, open = false) {
  const { ctx, master } = audio;
  const dur = open ? 0.18 : 0.04;
  const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 7500;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(open ? 0.022 : 0.018, time);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);
  src.connect(filter).connect(gain).connect(master);
  src.start(time);
}

// ════════════════════════════════════════════════════════════════
// SCHEDULER — generalized over any song
// ════════════════════════════════════════════════════════════════

function scheduleStep(audio, song, stepInLoop, time) {
  const bar = Math.floor(stepInLoop / STEPS_PER_BAR);
  const stepInBar = stepInLoop % STEPS_PER_BAR;
  const chord = song.progression[bar];
  const groove = GROOVES[song.groove];
  const beatSec = 60 / song.bpm;

  if (groove.pad(stepInBar, bar)) {
    TRIAD[chord].forEach(n => vPad(audio, f(n), time, 4 * beatSec, song.leadMode));
  }
  if (groove.bass(stepInBar, bar)) {
    vBass(audio, f(ROOT[chord]), time, groove.bassDur * beatSec);
  }
  if (groove.sub(stepInBar, bar)) {
    vSub(audio, f(ROOT[chord]), time, 4 * beatSec);
  }
  if (groove.arp(stepInBar, bar)) {
    const idx = groove.arpIdx(stepInBar) % ARP[chord].length;
    vArp(audio, f(ARP[chord][idx]), time, groove.arpVol);
  }
  if (groove.kick(stepInBar, bar)) vKick(audio, time);
  if (groove.snare(stepInBar, bar)) vSnare(audio, time, stepInBar === 14 ? 0.5 : 1);
  if (groove.hat(stepInBar, bar)) vHat(audio, time, false);
  if (groove.hatOpen(stepInBar, bar)) vHat(audio, time, true);
  if (groove.turnaround(stepInBar, bar)) {
    if (song.groove === 'anthem') vSnare(audio, time, 0.4);
    else vKick(audio, time, 0.7);
  }

  if (song.melody[stepInLoop]) {
    song.melody[stepInLoop].forEach(({ pitch, dur }) =>
      vLead(audio, f(pitch), time, dur * beatSec, song.leadMode)
    );
  }
  if (song.counter[stepInLoop]) {
    song.counter[stepInLoop].forEach(({ pitch, dur }) =>
      vCounter(audio, f(pitch), time, dur * beatSec, song.leadMode)
    );
  }
}

// ════════════════════════════════════════════════════════════════
// PLAYER HOOK
// ════════════════════════════════════════════════════════════════

function useTheme() {
  const [songId, setSongId] = useState('mainframe');
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(0);
  const [vol, setVolState] = useState(0.5);
  const [muted, setMuted] = useState(false);

  const audioRef = useRef(null);
  const songRef = useRef(SONGS[songId]);
  const stateRef = useRef({ next: 0, current: 0, handle: null });

  // Keep songRef in sync with state (and update synchronously when changing songs)
  useEffect(() => { songRef.current = SONGS[songId]; }, [songId]);

  const ensure = useCallback(() => {
    if (!audioRef.current) audioRef.current = makeAudio();
    if (audioRef.current.ctx.state === 'suspended') audioRef.current.ctx.resume();
    return audioRef.current;
  }, []);

  const tick = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const SCHEDULE_AHEAD = 0.12;
    const song = songRef.current;
    const stepSec = (60 / song.bpm) / STEPS_PER_BEAT;
    const loopSteps = song.bars * STEPS_PER_BAR;

    while (stateRef.current.next < audio.ctx.currentTime + SCHEDULE_AHEAD) {
      scheduleStep(audio, song, stateRef.current.current % loopSteps, stateRef.current.next);
      stateRef.current.next += stepSec;
      stateRef.current.current++;
    }
    setStep(stateRef.current.current % loopSteps);
    stateRef.current.handle = setTimeout(tick, 25);
  }, []);

  const start = useCallback(() => {
    const audio = ensure();
    audio.master.gain.cancelScheduledValues(audio.ctx.currentTime);
    audio.master.gain.linearRampToValueAtTime(muted ? 0 : vol, audio.ctx.currentTime + 0.05);
    stateRef.current.next = audio.ctx.currentTime + 0.1;
    stateRef.current.current = 0;
    setStep(0);
    setPlaying(true);
    if (stateRef.current.handle) clearTimeout(stateRef.current.handle);
    tick();
  }, [ensure, muted, vol, tick]);

  const stop = useCallback(() => {
    if (stateRef.current.handle) {
      clearTimeout(stateRef.current.handle);
      stateRef.current.handle = null;
    }
    if (audioRef.current) {
      const a = audioRef.current;
      a.master.gain.cancelScheduledValues(a.ctx.currentTime);
      a.master.gain.linearRampToValueAtTime(0, a.ctx.currentTime + 0.1);
    }
    setPlaying(false);
  }, []);

  // Switch song — preserves play/stop state, restarts from bar 1 of new song
  const changeSong = useCallback((newId) => {
    if (newId === songId) return;
    songRef.current = SONGS[newId];
    setSongId(newId);
    if (stateRef.current.handle && audioRef.current) {
      // Currently playing — quick fade, restart at bar 1
      const a = audioRef.current;
      a.master.gain.cancelScheduledValues(a.ctx.currentTime);
      a.master.gain.linearRampToValueAtTime(0, a.ctx.currentTime + 0.05);
      a.master.gain.linearRampToValueAtTime(muted ? 0 : vol, a.ctx.currentTime + 0.15);
      stateRef.current.next = a.ctx.currentTime + 0.15;
      stateRef.current.current = 0;
      setStep(0);
    }
  }, [songId, vol, muted]);

  useEffect(() => {
    if (audioRef.current && playing && !muted) {
      const a = audioRef.current;
      a.master.gain.linearRampToValueAtTime(vol, a.ctx.currentTime + 0.05);
    }
  }, [vol, playing, muted]);

  useEffect(() => {
    if (audioRef.current && playing) {
      const a = audioRef.current;
      a.master.gain.linearRampToValueAtTime(muted ? 0 : vol, a.ctx.currentTime + 0.05);
    }
  }, [muted, playing, vol]);

  useEffect(() => () => {
    if (stateRef.current.handle) clearTimeout(stateRef.current.handle);
    if (audioRef.current) audioRef.current.ctx.close();
  }, []);

  return {
    songId, song: SONGS[songId], changeSong,
    playing, step, vol, muted,
    setVol: setVolState,
    toggleMute: () => setMuted(m => !m),
    start, stop,
    getAnalyser: () => audioRef.current?.analyser,
  };
}

// ════════════════════════════════════════════════════════════════
// SPECTRUM VISUALIZER
// ════════════════════════════════════════════════════════════════

function Spectrum({ getAnalyser, playing, accent }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx2d = canvas.getContext('2d');
    let raf;
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    const resize = () => {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx2d.clearRect(0, 0, w, h);

      ctx2d.strokeStyle = 'rgba(0, 240, 255, 0.07)';
      ctx2d.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        const y = (h / 4) * i;
        ctx2d.beginPath();
        ctx2d.moveTo(0, y); ctx2d.lineTo(w, y);
        ctx2d.stroke();
      }

      const analyser = getAnalyser();
      if (analyser && playing) {
        const Nbin = analyser.frequencyBinCount;
        const data = new Uint8Array(Nbin);
        analyser.getByteFrequencyData(data);
        const useBins = Math.floor(Nbin * 0.7);
        const barWidth = w / useBins;
        for (let i = 0; i < useBins; i++) {
          const v = data[i] / 255;
          const barH = Math.pow(v, 0.85) * h;
          let color;
          if (i < useBins * 0.3) color = C.cyan;
          else if (i < useBins * 0.6) color = C.green;
          else color = C.pink;
          ctx2d.fillStyle = color;
          ctx2d.shadowColor = color;
          ctx2d.shadowBlur = 8 * v;
          ctx2d.fillRect(i * barWidth, h - barH, Math.max(1, barWidth - 1), barH);
        }
        ctx2d.shadowBlur = 0;

        const td = new Uint8Array(analyser.fftSize);
        analyser.getByteTimeDomainData(td);
        ctx2d.strokeStyle = accent;
        ctx2d.globalAlpha = 0.7;
        ctx2d.lineWidth = 1.5;
        ctx2d.shadowColor = accent;
        ctx2d.shadowBlur = 6;
        ctx2d.beginPath();
        for (let i = 0; i < td.length; i++) {
          const x = (i / td.length) * w;
          const y = h / 2 + ((td[i] - 128) / 128) * (h * 0.35);
          if (i === 0) ctx2d.moveTo(x, y);
          else ctx2d.lineTo(x, y);
        }
        ctx2d.stroke();
        ctx2d.shadowBlur = 0;
        ctx2d.globalAlpha = 1;
      } else {
        ctx2d.strokeStyle = 'rgba(63, 63, 70, 0.6)';
        ctx2d.lineWidth = 1;
        ctx2d.beginPath();
        ctx2d.moveTo(0, h / 2); ctx2d.lineTo(w, h / 2);
        ctx2d.stroke();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, [getAnalyser, playing, accent]);

  return <canvas ref={canvasRef} className="w-full h-full block" />;
}

// ════════════════════════════════════════════════════════════════
// TRACK SELECTOR
// ════════════════════════════════════════════════════════════════

function TrackSelector({ songId, changeSong }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-[9px] text-zinc-500 px-1">
        <Music size={10} style={{ color: C.green }} />
        <span>SELECT CHANNEL</span>
        <span className="blink" style={{ color: C.green }}>▓</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {Object.values(SONGS).map((s, i) => {
          const active = songId === s.id;
          return (
            <button key={s.id} onClick={() => changeSong(s.id)}
              className={`btn-3d font-pixel text-left p-3 transition-all relative slide-up ${active ? 'neon-pulse' : ''}`}
              style={{
                color: s.accent,
                background: active ? `${s.accent}1f` : '#0a0a0a',
                animationDelay: `${i * 0.06}s`,
              }}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-[8px] text-zinc-500">CH {s.channel}</div>
                <s.Icon size={12} style={{ color: s.accent, filter: active ? `drop-shadow(0 0 4px ${s.accent})` : 'none' }} />
              </div>
              <div className="text-[9px] mb-1 leading-tight" style={{ textShadow: active ? `0 0 6px ${s.accent}` : 'none' }}>
                {s.title}
              </div>
              <div className="font-crt text-sm text-zinc-400 leading-none">{s.bpm} BPM</div>
              <div className="font-crt text-xs text-zinc-500 leading-tight mt-0.5">{s.keyName}</div>
              {active && (
                <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: s.accent, boxShadow: `0 0 4px ${s.accent}` }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// APP
// ════════════════════════════════════════════════════════════════

export default function App() {
  const { songId, song, changeSong, playing, step, vol, muted, setVol, toggleMute, start, stop, getAnalyser } = useTheme();

  const STEP_SEC = (60 / song.bpm) / STEPS_PER_BEAT;
  const LOOP_STEPS = song.bars * STEPS_PER_BAR;
  const beat = Math.floor(step / STEPS_PER_BEAT);
  const bar = Math.floor(step / STEPS_PER_BAR);
  const beatInBar = beat % 4;
  const onBeat = step % STEPS_PER_BEAT === 0;
  const accent = song.accent;

  // Layer activity per song (which voices are present in this song's groove)
  const layers = [
    { name: 'PAD',     active: playing, color: C.purple },
    { name: 'BASS',    active: playing, color: C.cyan },
    { name: 'ARP',     active: playing && song.groove !== 'ambient', color: C.green },
    { name: 'DRUMS',   active: playing && song.groove !== 'ambient', color: C.pink },
    { name: 'LEAD',    active: playing && bar >= 4, color: C.yellow },
    { name: 'COUNTER', active: playing && Object.keys(song.counter).length > 0 && bar < 4,  color: C.cyan },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8 font-pixel relative overflow-hidden">
      <InjectedStyles />

      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at top, ${accent}1a, transparent 60%), radial-gradient(ellipse at bottom right, rgba(0,240,255,0.10), transparent 60%)` }} />

      <div className="max-w-3xl mx-auto relative z-10 space-y-5">
        {/* Header */}
        <header className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
            <Radio size={12} className="animate-pulse" style={{ color: C.green }} />
            <span>SYS:// AUDIO BROADCAST READY · 4 CHANNELS</span>
            <span className="blink" style={{ color: C.green }}>▓</span>
          </div>
          <div className="text-2xl sm:text-3xl glitch-slow" style={{ color: C.pink }}>NOGHURT BRAIN</div>
          <div className="text-xl sm:text-2xl text-glow leading-tight" style={{ color: C.cyan }}>
            ★ JUKEBOX ★
          </div>
          <div className="font-crt text-base" style={{ color: C.green }}>SOUNDTRACK v2.0 · 4 ORIGINAL TRACKS</div>
        </header>

        {/* Track selector */}
        <TrackSelector songId={songId} changeSong={changeSong} />

        {/* Main display card */}
        <div className="relative bg-black border-4 border-zinc-800 rounded-lg overflow-hidden scanlines"
          style={{ boxShadow: `0 0 0 2px #000, 0 0 40px ${accent}33, inset 0 0 60px rgba(0,0,0,0.8)` }}>
          <div className="scan-line" />

          <div className="relative h-44 sm:h-52 bg-black border-b-2 border-zinc-800">
            <Spectrum getAnalyser={getAnalyser} playing={playing} accent={accent} />
            {!playing && (
              <div className="absolute inset-0 grid place-items-center">
                <div className="font-crt text-xl text-zinc-600">▸ AWAITING BROADCAST ▸</div>
              </div>
            )}
            <div className="absolute bottom-1 left-2 right-2 flex justify-between font-pixel text-[7px] text-zinc-700 pointer-events-none">
              <span style={{ color: C.cyan }}>BASS</span>
              <span style={{ color: C.green }}>MID</span>
              <span style={{ color: C.pink }}>HIGH</span>
            </div>
          </div>

          <div className="p-4 sm:p-5 space-y-3.5">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="text-[9px] text-zinc-500">▸ NOW BROADCASTING · CH {song.channel}</div>
                <div className="text-sm sm:text-base text-glow-soft" style={{ color: accent }}>
                  {song.title}
                </div>
                <div className="font-crt text-base text-zinc-400">
                  {song.bpm} BPM · {song.keyName} · {song.bars}-BAR LOOP
                </div>
                <div className="font-crt text-sm text-zinc-500 mt-0.5">USE: {song.use}</div>
              </div>
              <div className="text-right">
                <div className="text-[9px] text-zinc-500">RUNTIME</div>
                <div className="text-base tabular-nums" style={{ color: C.green }}>
                  {playing
                    ? `${Math.floor((step * STEP_SEC) / 60).toString().padStart(2, '0')}:${Math.floor((step * STEP_SEC) % 60).toString().padStart(2, '0')}`
                    : '00:00'}
                </div>
              </div>
            </div>

            {/* Bar progress */}
            <div>
              <div className="flex items-center justify-between text-[9px] text-zinc-500 mb-1.5">
                <span>BAR <span style={{ color: accent }}>{(bar + 1).toString().padStart(2, '0')}</span> / {song.bars.toString().padStart(2, '0')}</span>
                <span>STEP <span style={{ color: accent }}>{(step + 1).toString().padStart(3, '0')}</span> / {LOOP_STEPS.toString().padStart(3, '0')}</span>
              </div>
              <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${song.bars}, minmax(0, 1fr))` }}>
                {Array.from({ length: song.bars }).map((_, i) => {
                  const isActive = i === bar && playing;
                  const isPast = i < bar && playing;
                  return (
                    <div key={i} className="relative h-2 border border-zinc-800 overflow-hidden"
                      style={{
                        background: isActive ? accent : isPast ? '#1f2937' : '#0a0a0a',
                        boxShadow: isActive ? `0 0 8px ${accent}` : 'none',
                      }}>
                      {isActive && (
                        <div className="absolute inset-0 bg-white/30"
                          style={{ width: `${((step % STEPS_PER_BAR) / STEPS_PER_BAR) * 100}%` }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="text-[9px] text-zinc-500">BEAT</div>
                <div className="flex gap-1.5">
                  {[0, 1, 2, 3].map(i => {
                    const isOn = i === beatInBar && playing;
                    const isStrong = i === 0 || i === 2;
                    const color = isStrong ? C.pink : C.cyan;
                    return (
                      <div key={i}
                        className={`w-3 h-3 rounded-sm border ${isOn && onBeat ? 'beat-pulse' : ''}`}
                        style={{
                          borderColor: color,
                          background: isOn ? color : 'transparent',
                          boxShadow: isOn ? `0 0 8px ${color}` : 'none',
                        }} />
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-[9px] text-zinc-500">CHORD</div>
                <div className="font-pixel text-xs px-2 py-1 border-2"
                  style={{
                    color: playing ? accent : '#52525b',
                    borderColor: playing ? accent : '#3f3f46',
                    background: playing ? `${accent}11` : 'transparent',
                  }}>
                  {playing ? song.progression[bar] : '—'}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[9px] text-zinc-500">▸ LAYER ACTIVITY</div>
              {layers.map(layer => (
                <div key={layer.name} className="flex items-center gap-2">
                  <div className="text-[8px] w-16" style={{ color: layer.active ? layer.color : '#52525b' }}>
                    {layer.name}
                  </div>
                  <div className="flex-1 h-1.5 bg-zinc-900 border border-zinc-800 overflow-hidden">
                    <div className="h-full transition-all"
                      style={{
                        width: layer.active ? '100%' : '0%',
                        background: layer.color,
                        boxShadow: layer.active ? `0 0 6px ${layer.color}` : 'none',
                        opacity: layer.active ? 0.8 : 0,
                      }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button onClick={() => playing ? stop() : start()}
            className={`btn-3d font-pixel text-sm sm:text-base py-4 ${playing ? '' : 'neon-pulse'}`}
            style={{ color: playing ? C.red : C.green, background: '#0a0a0a' }}>
            <span className="flex items-center justify-center gap-2">
              {playing ? <><Pause size={16} />STOP</> : <><Play size={16} />ENGAGE</>}
            </span>
          </button>

          <button onClick={toggleMute}
            className="btn-3d font-pixel text-xs py-4"
            style={{ color: muted ? '#52525b' : C.cyan, background: '#0a0a0a' }}>
            <span className="flex items-center justify-center gap-2">
              {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              {muted ? 'MUTED' : 'AUDIO ON'}
            </span>
          </button>

          <div className="flex items-center gap-2 px-3 py-3 border-2 border-zinc-800 bg-black">
            <Volume2 size={12} style={{ color: C.cyan }} />
            <input type="range" min="0" max="1" step="0.01" value={vol}
              onChange={e => setVol(parseFloat(e.target.value))}
              className="flex-1 accent-cyan-400" />
            <div className="font-pixel text-[9px] tabular-nums w-8 text-right" style={{ color: C.cyan }}>
              {Math.round(vol * 100)}
            </div>
          </div>
        </div>

        {/* Liner notes for active track */}
        <div className="border-2 p-4 sm:p-5 bg-black/50 backdrop-blur-sm space-y-2"
          style={{ borderColor: `${accent}66` }}>
          <div className="flex items-center gap-2 mb-1">
            <Disc3 size={14} className="warning-pulse" style={{ color: accent }} />
            <div className="font-pixel text-xs" style={{ color: accent }}>
              CH {song.channel} · {song.title} · {song.subtitle}
            </div>
          </div>
          <div className="font-crt text-base text-zinc-300 leading-relaxed">
            {song.description}
          </div>
          <div className="pt-2 border-t border-zinc-800 text-[9px] text-zinc-500 flex flex-wrap gap-3">
            <span><span className="text-zinc-400">PROG:</span> {song.progression.join(' · ')}</span>
            <span><span className="text-zinc-400">LEAD:</span> {song.leadMode}</span>
            <span><span className="text-zinc-400">GROOVE:</span> {song.groove}</span>
          </div>
        </div>

        <footer className="text-center font-pixel text-[9px] text-zinc-600 flex items-center justify-center gap-2">
          <span style={{ color: C.green }}>●</span>
          GENERATED IN-BROWSER · WEB AUDIO API · NO SAMPLES · 4 ORIGINAL TRACKS
          <span style={{ color: C.green }}>●</span>
        </footer>
      </div>
    </div>
  );
}
