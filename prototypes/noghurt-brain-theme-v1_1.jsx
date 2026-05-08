import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Disc3, Radio, Power } from 'lucide-react';

// ════════════════════════════════════════════════════════════════
// PALETTE & STYLES (matching the app)
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
  `}</style>
);

// ════════════════════════════════════════════════════════════════
// THE COMPOSITION
// ════════════════════════════════════════════════════════════════
//
// Title:        "MAINFRAME" (Noghurt Brain Theme v1.0)
// Key:          A minor (with E7 leading-tone tension)
// Tempo:        100 BPM
// Time sig:     4/4
// Loop length:  8 bars (= ~19.2 sec per loop)
// Progression:  | Am | F | C | G | Am | F | E | Am |
// Form:         Melody enters on bar 5 each loop, leaving bars 1-4 as "breath"
//               Hook: A4 → big leap to E5 (5th) → walks down → leap to F5 (6th)
//               → resolves through E phrygian leading tone Gs4 → A4
//
// Why this works:
// - The empty 4 bars + melody 4 bars structure mimics Aria Math's patience
// - The 16th-note arp + kick/snare on 1+3/2+4 mimics Kahoot's drive
// - The Am-F-C-G is the most singable pop-minor progression ever written
// - The Gs4 leading tone over E7 is the OSRS/medieval "modal interchange" lift

const BPM = 100;
const STEPS_PER_BEAT = 4; // 16th-note resolution
const STEPS_PER_BAR = STEPS_PER_BEAT * 4;
const STEP_SEC = 60 / BPM / STEPS_PER_BEAT;
const LOOP_BARS = 8;
const LOOP_STEPS = LOOP_BARS * STEPS_PER_BAR;

// MIDI helper
const f = (n) => 440 * Math.pow(2, (n - 69) / 12);
// Note constants (MIDI numbers)
const N = {
  A1: 33, E2: 40, F2: 41, G2: 43, A2: 45, B2: 47,
  C3: 48, D3: 50, E3: 52, F3: 53, G3: 55, Gs3: 56, A3: 57, B3: 59,
  C4: 60, D4: 62, E4: 64, F4: 65, G4: 67, Gs4: 68, A4: 69, B4: 71,
  C5: 72, D5: 74, E5: 76, F5: 77, G5: 79, A5: 81,
};

// 8-bar progression (one chord per bar)
const PROG = ['Am', 'F', 'C', 'G', 'Am', 'F', 'E', 'Am'];

const ROOT = { Am: N.A2, F: N.F2, C: N.C3, G: N.G2, E: N.E2 };

const TRIAD = {
  Am: [N.A3, N.C4, N.E4],
  F:  [N.F3, N.A3, N.C4],
  C:  [N.C4, N.E4, N.G4],
  G:  [N.G3, N.B3, N.D4],
  E:  [N.E3, N.Gs3, N.B3],
};

// Arpeggio pattern: 8 8th-notes per bar (UP-DOWN-UP-DOWN of the triad)
const ARP = {
  Am: [N.A3, N.C4, N.E4, N.C4, N.A3, N.C4, N.E4, N.C4],
  F:  [N.F3, N.A3, N.C4, N.A3, N.F3, N.A3, N.C4, N.A3],
  C:  [N.C4, N.E4, N.G4, N.E4, N.C4, N.E4, N.G4, N.E4],
  G:  [N.G3, N.B3, N.D4, N.B3, N.G3, N.B3, N.D4, N.B3],
  E:  [N.E3, N.Gs3, N.B3, N.Gs3, N.E3, N.Gs3, N.B3, N.Gs3],
};

// MELODY — the hook. v1.1: dwelling peaks, contour variety, motivic recall.
// Format: { stepInLoop: { pitch, durBeats } }
//
// Bar 5 (Am): leap up to E5 and let it BREATHE (1.5 beats, was 0.75)
// Bar 6 (F):  leap to F5 and let it DWELL (2 beats, was 1.5) — this is the peak
// Bar 7 (E):  instead of walking down a third time, ASCEND back to E5 (motivic recall)
//             then descend to a brief Gs4 leading tone with a rest before it for breath
// Bar 8 (Am): A4 resolution + upper-neighbor turn (C5-B4-A4) for proper closure
const MELODY_RAW = [
  // Bar 5 (Am): . A4 E5----- . D5
  [68,  N.A4, 1.0],   // beat 2 — entry
  [72,  N.E5, 1.5],   // beat 3 — the leap, NOW HOLDS for a dotted quarter
  [78,  N.D5, 0.5],   // beat 4.5 — graceful step down

  // Bar 6 (F): C5 F5---------- E5
  [80,  N.C5, 1.0],   // beat 1
  [84,  N.F5, 2.0],   // beat 2 — THE peak, now sustained for two full beats
  [92,  N.E5, 1.0],   // beat 4 — single descent (was 3 notes, now 1)

  // Bar 7 (E): D5 E5----- C5 B4 . Gs4 — motivic recall + breathing space
  [96,  N.D5, 0.5],   // beat 1 — pickup
  [98,  N.E5, 1.5],   // beat 1.5 — RETURN to E5: the contour reversal that breaks descent fatigue
  [104, N.C5, 0.5],   // beat 3
  [106, N.B4, 0.5],   // beat 3.5
  // beat 4: rest (the breath before the leading tone)
  [110, N.Gs4, 0.5],  // beat 4.5 — brief leading tone, slammed right before resolution

  // Bar 8 (Am): A4---- . C5 B4 A4--- — resolution with closing turn
  [112, N.A4, 2.0],   // beat 1 — landing
  [120, N.C5, 0.5],   // beat 3 — upper neighbor (the turn lifts)
  [122, N.B4, 0.5],   // beat 3.5
  [124, N.A4, 1.0],   // beat 4 — final tonic
];

const MELODY = {};
for (const [step, pitch, dur] of MELODY_RAW) {
  if (!MELODY[step]) MELODY[step] = [];
  MELODY[step].push({ pitch, dur });
}

// Sub-bass: an octave lower, on beat 1 only, every other bar (gives weight)
const SUBBASS_BARS = [0, 2, 4, 6]; // bars 1, 3, 5, 7

// Counter-melody (super sparse, plays in bars 1-4 to keep them interesting)
// A simple call: a single note that hints at the coming hook
const COUNTER_RAW = [
  [16,  N.A3, 2.0],    // bar 2 beat 1 — A3 hint
  [40,  N.C4, 2.0],    // bar 3 beat 3 — C4 climb
  [56,  N.E4, 1.0],    // bar 4 beat 3 — E4 sets up the leap
  [60,  N.G4, 1.0],    // bar 4 beat 4 — pickup into bar 5 melody
];
const COUNTER = {};
for (const [step, pitch, dur] of COUNTER_RAW) {
  if (!COUNTER[step]) COUNTER[step] = [];
  COUNTER[step].push({ pitch, dur });
}

// ════════════════════════════════════════════════════════════════
// SYNTH VOICES (Web Audio API)
// ════════════════════════════════════════════════════════════════

function makeAudio() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  const ctx = new Ctx();

  // Master chain: gain → compressor → analyser → destination
  const master = ctx.createGain();
  master.gain.value = 0.45;

  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -18;
  comp.knee.value = 12;
  comp.ratio.value = 4;
  comp.attack.value = 0.005;
  comp.release.value = 0.15;

  // Convolution-like reverb via short delay feedback (cheap reverb)
  const reverbSend = ctx.createGain();
  reverbSend.gain.value = 0.18;
  const delay = ctx.createDelay(1.0);
  delay.delayTime.value = 0.18;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.35;
  const reverbReturn = ctx.createGain();
  reverbReturn.gain.value = 0.35;
  // delay loop
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

// LEAD — bright square + sub-octave sine. v1.1: delayed vibrato (clean attack,
// vibrato fades in over 200ms — like a real singer/violinist), attack pitch
// scoop (25 cents flat → pitch over 50ms — expressive lead character), reduced
// sub-octave gain for clearer top end.
function vLead(audio, freq, time, durBeats) {
  const { ctx, master, reverbSend } = audio;
  const dur = (durBeats * 60) / BPM;

  const osc = ctx.createOscillator();
  const sub = ctx.createOscillator(); // octave-down sine for body
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();

  // Pitch scoop on attack — start 25 cents flat, recover to pitch in 50ms.
  // This is the "expressive instrument" character — voice/violin/whistle.
  osc.type = 'square';
  osc.frequency.setValueAtTime(freq * 0.985, time);
  osc.frequency.exponentialRampToValueAtTime(freq, time + 0.05);

  sub.type = 'sine';
  sub.frequency.setValueAtTime((freq / 2) * 0.985, time);
  sub.frequency.exponentialRampToValueAtTime(freq / 2, time + 0.05);

  filter.type = 'lowpass';
  filter.frequency.value = 2800;
  filter.Q.value = 3;

  // Delayed vibrato — silent for first 120ms, then ramps up to ±4.5 Hz over 200ms.
  // Notes start CLEAN, vibrato develops on sustain. Short notes get no vibrato (correct).
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
  subGain.gain.value = 0.25; // reduced from 0.35 — cleaner top, less low-mid mush
  sub.connect(subGain).connect(filter);
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(master);
  gain.connect(reverbSend);

  osc.start(time); sub.start(time); lfo.start(time);
  osc.stop(time + dur + 0.1);
  sub.stop(time + dur + 0.1);
  lfo.stop(time + dur + 0.1);
}

// COUNTER — softer triangle with same vibrato, plays in bars 1-4
function vCounter(audio, freq, time, durBeats) {
  const { ctx, master, reverbSend } = audio;
  const dur = (durBeats * 60) / BPM;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'triangle';
  osc.frequency.value = freq;
  filter.type = 'lowpass';
  filter.frequency.value = 1800;

  const peak = 0.05;
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(peak, time + 0.05);
  gain.gain.linearRampToValueAtTime(peak * 0.4, time + dur * 0.6);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

  osc.connect(filter).connect(gain);
  gain.connect(master);
  gain.connect(reverbSend);
  osc.start(time);
  osc.stop(time + dur + 0.05);
}

// BASS — fat detuned saws, low-passed, punchy
function vBass(audio, freq, time, durBeats) {
  const { ctx, master } = audio;
  const dur = (durBeats * 60) / BPM;
  const o1 = ctx.createOscillator();
  const o2 = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  o1.type = 'sawtooth';
  o2.type = 'sawtooth';
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
  o1.stop(time + dur + 0.05);
  o2.stop(time + dur + 0.05);
}

// SUB-BASS — sine octave below for chest weight
function vSub(audio, freq, time, durBeats) {
  const { ctx, master } = audio;
  const dur = (durBeats * 60) / BPM;
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

// ARP — short pulse plucks
function vArp(audio, freq, time) {
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
  gain.gain.exponentialRampToValueAtTime(0.04, time + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

  osc.connect(filter).connect(gain);
  gain.connect(master);
  gain.connect(reverbSend);
  osc.start(time);
  osc.stop(time + dur + 0.02);
}

// PAD — slow triangle pad, wash of harmony
function vPad(audio, freq, time, durBeats) {
  const { ctx, master, reverbSend } = audio;
  const dur = (durBeats * 60) / BPM;
  const osc = ctx.createOscillator();
  const detuneOsc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'triangle';
  osc.frequency.value = freq;
  detuneOsc.type = 'triangle';
  detuneOsc.frequency.value = freq * 1.003;

  filter.type = 'lowpass';
  filter.frequency.value = 1200;

  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.linearRampToValueAtTime(0.022, time + 0.4);
  gain.gain.linearRampToValueAtTime(0.018, time + dur * 0.7);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

  osc.connect(filter); detuneOsc.connect(filter);
  filter.connect(gain);
  gain.connect(master);
  gain.connect(reverbSend);
  osc.start(time); detuneOsc.start(time);
  osc.stop(time + dur + 0.1);
  detuneOsc.stop(time + dur + 0.1);
}

// KICK — sine with rapid pitch drop
function vKick(audio, time) {
  const { ctx, master } = audio;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(140, time);
  osc.frequency.exponentialRampToValueAtTime(40, time + 0.1);
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(0.32, time + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.15);
  osc.connect(gain).connect(master);
  osc.start(time);
  osc.stop(time + 0.18);
}

// SNARE — filtered noise + a tonal body
function vSnare(audio, time) {
  const { ctx, master } = audio;
  const dur = 0.13;

  // Noise burst
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
  noiseGain.gain.setValueAtTime(0.12, time);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

  // Body tone
  const body = ctx.createOscillator();
  body.type = 'triangle';
  body.frequency.setValueAtTime(220, time);
  body.frequency.exponentialRampToValueAtTime(120, time + 0.04);
  const bodyGain = ctx.createGain();
  bodyGain.gain.setValueAtTime(0.06, time);
  bodyGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);

  src.connect(noiseFilter).connect(noiseGain).connect(master);
  body.connect(bodyGain).connect(master);
  src.start(time);
  body.start(time);
  body.stop(time + 0.06);
}

// HI-HAT — short noise burst, high-passed
function vHat(audio, time, open = false) {
  const { ctx, master } = audio;
  const dur = open ? 0.18 : 0.04;
  const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  }
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
// SCHEDULER (lookahead pattern for sample-accurate timing)
// ════════════════════════════════════════════════════════════════

function scheduleStep(audio, stepInLoop, time) {
  const bar = Math.floor(stepInLoop / STEPS_PER_BAR);
  const stepInBar = stepInLoop % STEPS_PER_BAR;
  const beatInBar = Math.floor(stepInBar / STEPS_PER_BEAT);
  const subInBeat = stepInBar % STEPS_PER_BEAT;
  const chord = PROG[bar];

  // PAD — every bar at beat 1, holds 4 beats
  if (stepInBar === 0) {
    TRIAD[chord].forEach(n => vPad(audio, f(n), time, 4));
  }

  // BASS — beats 1 and 3 (steps 0, 8). Beat 1 longer for body.
  if (stepInBar === 0) vBass(audio, f(ROOT[chord]), time, 1.75);
  if (stepInBar === 8) vBass(audio, f(ROOT[chord]), time, 1.75);

  // SUB-BASS — bars 1, 3, 5, 7 on beat 1
  if (stepInBar === 0 && SUBBASS_BARS.includes(bar)) {
    vSub(audio, f(ROOT[chord]), time, 4);
  }

  // ARP — every 8th note (every 2nd 16th-note step)
  if (subInBeat % 2 === 0) {
    const arpIdx = beatInBar * 2 + (subInBeat / 2);
    const note = ARP[chord][arpIdx];
    vArp(audio, f(note), time);
  }

  // KICK — beats 1 and 3
  if (stepInBar === 0 || stepInBar === 8) vKick(audio, time);
  // KICK — extra ghost on bar 8 beat 4.5 for turnaround punch
  if (bar === 7 && stepInBar === 14) vKick(audio, time);

  // SNARE — beats 2 and 4
  if (stepInBar === 4 || stepInBar === 12) vSnare(audio, time);

  // HI-HAT — every 8th
  if (subInBeat === 0) vHat(audio, time, false);
  if (subInBeat === 2) vHat(audio, time, beatInBar === 3); // open hat on offbeat of last beat

  // LEAD MELODY
  if (MELODY[stepInLoop]) {
    MELODY[stepInLoop].forEach(({ pitch, dur }) => vLead(audio, f(pitch), time, dur));
  }

  // COUNTER MELODY (bars 1-4)
  if (COUNTER[stepInLoop]) {
    COUNTER[stepInLoop].forEach(({ pitch, dur }) => vCounter(audio, f(pitch), time, dur));
  }
}

// ════════════════════════════════════════════════════════════════
// PLAYER HOOK
// ════════════════════════════════════════════════════════════════

function useTheme() {
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(0);
  const [vol, setVolState] = useState(0.5);
  const [muted, setMuted] = useState(false);

  const audioRef = useRef(null);
  const stateRef = useRef({ next: 0, current: 0, handle: null });

  const ensure = useCallback(() => {
    if (!audioRef.current) audioRef.current = makeAudio();
    if (audioRef.current.ctx.state === 'suspended') audioRef.current.ctx.resume();
    return audioRef.current;
  }, []);

  const tick = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const SCHEDULE_AHEAD = 0.12;
    while (stateRef.current.next < audio.ctx.currentTime + SCHEDULE_AHEAD) {
      scheduleStep(audio, stateRef.current.current % LOOP_STEPS, stateRef.current.next);
      stateRef.current.next += STEP_SEC;
      stateRef.current.current++;
    }
    setStep(stateRef.current.current % LOOP_STEPS);
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

  // Volume changes apply live
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

function Spectrum({ getAnalyser, playing }) {
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

      // Background grid lines
      ctx2d.strokeStyle = 'rgba(0, 240, 255, 0.07)';
      ctx2d.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        const y = (h / 4) * i;
        ctx2d.beginPath();
        ctx2d.moveTo(0, y);
        ctx2d.lineTo(w, y);
        ctx2d.stroke();
      }

      const analyser = getAnalyser();
      if (analyser && playing) {
        const N = analyser.frequencyBinCount;
        const data = new Uint8Array(N);
        analyser.getByteFrequencyData(data);

        const useBins = Math.floor(N * 0.7);
        const barWidth = w / useBins;
        for (let i = 0; i < useBins; i++) {
          const v = data[i] / 255;
          const barH = Math.pow(v, 0.85) * h;
          // Gradient by frequency: cyan low → green mid → pink high
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

        // Oscilloscope overlay
        const td = new Uint8Array(analyser.fftSize);
        analyser.getByteTimeDomainData(td);
        ctx2d.strokeStyle = 'rgba(255, 230, 0, 0.7)';
        ctx2d.lineWidth = 1.5;
        ctx2d.shadowColor = C.yellow;
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
      } else {
        // Idle: flat oscilloscope line in zinc
        ctx2d.strokeStyle = 'rgba(63, 63, 70, 0.6)';
        ctx2d.lineWidth = 1;
        ctx2d.beginPath();
        ctx2d.moveTo(0, h / 2);
        ctx2d.lineTo(w, h / 2);
        ctx2d.stroke();
      }

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, [getAnalyser, playing]);

  return <canvas ref={canvasRef} className="w-full h-full block" />;
}

// ════════════════════════════════════════════════════════════════
// UI
// ════════════════════════════════════════════════════════════════

export default function App() {
  const { playing, step, vol, muted, setVol, toggleMute, start, stop, getAnalyser } = useTheme();

  const beat = Math.floor(step / STEPS_PER_BEAT);
  const bar = Math.floor(step / STEPS_PER_BAR);
  const beatInBar = beat % 4;
  const onBeat = step % STEPS_PER_BEAT === 0;

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8 font-pixel relative overflow-hidden">
      <InjectedStyles />

      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at top, rgba(255,46,136,0.10), transparent 60%), radial-gradient(ellipse at bottom right, rgba(0,240,255,0.10), transparent 60%)' }} />

      <div className="max-w-3xl mx-auto relative z-10 space-y-6">
        {/* Header */}
        <header className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
            <Radio size={12} className="animate-pulse" style={{ color: C.green }} />
            <span>SYS:// AUDIO BROADCAST READY</span>
            <span className="blink" style={{ color: C.green }}>▓</span>
          </div>
          <div className="text-2xl sm:text-3xl glitch-slow" style={{ color: C.pink }}>NOGHURT BRAIN</div>
          <div className="text-3xl sm:text-5xl text-glow leading-tight" style={{ color: C.cyan }}>
            ★ MAINFRAME ★
          </div>
          <div className="font-crt text-lg" style={{ color: C.green }}>OFFICIAL THEME // v1.1</div>
        </header>

        {/* Main display card */}
        <div className="relative bg-black border-4 border-zinc-800 rounded-lg overflow-hidden scanlines"
          style={{ boxShadow: '0 0 0 2px #000, 0 0 40px rgba(0,240,255,0.18), inset 0 0 60px rgba(0,0,0,0.8)' }}>
          <div className="scan-line" />

          {/* Visualizer */}
          <div className="relative h-48 sm:h-56 bg-black border-b-2 border-zinc-800">
            <Spectrum getAnalyser={getAnalyser} playing={playing} />
            {!playing && (
              <div className="absolute inset-0 grid place-items-center">
                <div className="font-crt text-xl text-zinc-600">▸ AWAITING BROADCAST ▸</div>
              </div>
            )}
            {/* Frequency band labels */}
            <div className="absolute bottom-1 left-2 right-2 flex justify-between font-pixel text-[7px] text-zinc-700 pointer-events-none">
              <span style={{ color: C.cyan }}>BASS</span>
              <span style={{ color: C.green }}>MID</span>
              <span style={{ color: C.pink }}>HIGH</span>
            </div>
          </div>

          {/* Track info + meters */}
          <div className="p-4 sm:p-5 space-y-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="text-[9px] text-zinc-500">▸ NOW BROADCASTING</div>
                <div className="text-sm sm:text-base text-glow-soft" style={{ color: C.yellow }}>
                  THE MAINFRAME (THEME)
                </div>
                <div className="font-crt text-base text-zinc-400">
                  100 BPM · A MINOR · 8-BAR LOOP
                </div>
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
                <span>BAR <span style={{ color: C.cyan }}>{(bar + 1).toString().padStart(2, '0')}</span> / 08</span>
                <span>STEP <span style={{ color: C.cyan }}>{(step + 1).toString().padStart(3, '0')}</span> / 128</span>
              </div>
              <div className="grid grid-cols-8 gap-1">
                {Array.from({ length: 8 }).map((_, i) => {
                  const isActive = i === bar && playing;
                  const isPast = i < bar && playing;
                  return (
                    <div key={i} className="relative h-2 border border-zinc-800 overflow-hidden"
                      style={{
                        background: isActive ? C.cyan : isPast ? '#1f2937' : '#0a0a0a',
                        boxShadow: isActive ? `0 0 8px ${C.cyan}` : 'none',
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

            {/* Beat indicators */}
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
                    color: playing ? C.yellow : '#52525b',
                    borderColor: playing ? C.yellow : '#3f3f46',
                    background: playing ? `${C.yellow}11` : 'transparent',
                  }}>
                  {playing ? PROG[bar] : '—'}
                </div>
              </div>
            </div>

            {/* Layer activity meters */}
            <div className="space-y-1.5">
              <div className="text-[9px] text-zinc-500">▸ LAYER ACTIVITY</div>
              {[
                { name: 'PAD',     active: playing, color: C.purple },
                { name: 'BASS',    active: playing, color: C.cyan },
                { name: 'ARP',     active: playing, color: C.green },
                { name: 'DRUMS',   active: playing, color: C.pink },
                { name: 'LEAD',    active: playing && bar >= 4, color: C.yellow },
                { name: 'COUNTER', active: playing && bar < 4,  color: C.cyan },
              ].map(layer => (
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
            className={`btn-3d font-pixel text-sm sm:text-base py-4 sm:col-span-1 ${playing ? '' : 'neon-pulse'}`}
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

        {/* Liner notes */}
        <div className="border-2 border-zinc-800 p-4 sm:p-5 bg-black/50 backdrop-blur-sm space-y-3">
          <div className="flex items-center gap-2">
            <Disc3 size={14} className="warning-pulse" style={{ color: C.pink }} />
            <div className="font-pixel text-xs" style={{ color: C.pink }}>LINER NOTES</div>
          </div>
          <div className="font-crt text-base text-zinc-300 leading-relaxed space-y-2">
            <p>
              <span style={{ color: C.cyan }}>FORM</span> — 8-bar loop in A minor.
              The first 4 bars breathe (bass + arp + a single counter-melodic note climbing),
              the last 4 carry the hook. Drops you into a perfect loop that never feels repetitive.
            </p>
            <p>
              <span style={{ color: C.green }}>HOOK (v1.1)</span> — bar 5 leaps a perfect fifth
              (A4 → E5) and now <em>dwells</em> on the peak. Bar 6 leaps to F5 and holds for
              two full beats — the proper "wow." Bar 7 doesn't walk down a third time
              (which was the v1.0 issue) — it <em>ascends</em> back to E5 (motivic recall),
              then drops to a brief Gs4 leading tone with a beat of rest before it for breath.
              Bar 8 lands on A4 with an upper-neighbor turn (C5-B4-A4) for proper closure.
            </p>
            <p>
              <span style={{ color: C.yellow }}>LEAD (v1.1)</span> — square + sub-octave sine,
              now with a 25-cent attack pitch scoop (the "expressive instrument" character),
              and delayed vibrato that fades in over 200ms after note start.
              Notes attack clean, then come alive on sustain — exactly what real
              singers and wind instruments do.
            </p>
            <p>
              <span style={{ color: C.pink }}>USE CASE</span> — lobby loading music, host-screen
              idle, between-round breath. Tempo locks to 100 BPM so the in-game timer can
              syncopate against it.
            </p>
          </div>
        </div>

        <footer className="text-center font-pixel text-[9px] text-zinc-600 flex items-center justify-center gap-2">
          <span style={{ color: C.green }}>●</span>
          GENERATED IN-BROWSER · WEB AUDIO API · NO SAMPLES · NO LICENSE
          <span style={{ color: C.green }}>●</span>
        </footer>
      </div>
    </div>
  );
}
