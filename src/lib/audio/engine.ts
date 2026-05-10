/**
 * Web Audio chiptune engine. Ported from prototypes/noghurt-brain-jukebox.jsx.
 *
 * Architecture: single AudioContext singleton with master gain → compressor →
 * destination, plus a parallel reverb (delay+feedback) bus. Voices are
 * one-shot oscillators created per scheduled step, with attack/sustain/release
 * envelopes. The scheduler ticks every 25ms with 120ms lookahead.
 *
 * Per docs/CLAUDE.md, music is a v1.5+ feature; user explicitly authorized
 * the v1 port.
 */

// MIDI helpers
export const STEPS_PER_BEAT = 4;
export const STEPS_PER_BAR = STEPS_PER_BEAT * 4;

export const f = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

export const N = {
  A1: 33, Bb1: 34, C2: 36, D2: 38, E2: 40, F2: 41, G2: 43, A2: 45, Bb2: 46, B2: 47,
  C3: 48, D3: 50, Eb3: 51, E3: 52, F3: 53, Fs3: 54, G3: 55, Gs3: 56, A3: 57, Bb3: 58, B3: 59,
  C4: 60, Cs4: 61, D4: 62, Eb4: 63, E4: 64, F4: 65, Fs4: 66, G4: 67, Gs4: 68, A4: 69, Bb4: 70, B4: 71,
  C5: 72, Cs5: 73, D5: 74, Eb5: 75, E5: 76, F5: 77, Fs5: 78, G5: 79, Gs5: 80, A5: 81, Bb5: 82, B5: 83, C6: 84,
} as const;

export type ChordName = 'Am' | 'F' | 'C' | 'G' | 'E' | 'Dm' | 'Bb' | 'A7' | 'Gm' | 'D';

export const ROOT: Record<ChordName, number> = {
  Am: N.A2, F: N.F2, C: N.C3, G: N.G2, E: N.E2,
  Dm: N.D2, Bb: N.Bb2, A7: N.A2, Gm: N.G2, D: N.D3,
};

export const TRIAD: Record<ChordName, number[]> = {
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

export const ARP: Record<ChordName, number[]> = {
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

export type Note = { pitch: number; dur: number };
export type MelodyDict = Record<number, Note[]>;

export type LeadMode = 'classic' | 'dark' | 'anthem' | 'ambient';
export type GrooveName = 'classic' | 'driving' | 'anthem' | 'ambient';

export type Audio = {
  ctx: AudioContext;
  master: GainNode;
  reverbSend: GainNode;
};

export function melodyDict(raw: Array<[number, number, number]>): MelodyDict {
  const out: MelodyDict = {};
  for (const [step, pitch, dur] of raw) {
    if (!out[step]) out[step] = [];
    out[step].push({ pitch, dur });
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// GROOVES — per-song rhythm presets
// ─────────────────────────────────────────────────────────────────────────────

type GroovePreset = {
  bass: (s: number, b: number) => boolean;
  bassDur: number;
  sub: (s: number, b: number) => boolean;
  kick: (s: number, b: number) => boolean;
  snare: (s: number, b: number) => boolean;
  hat: (s: number, b: number) => boolean;
  hatOpen: (s: number, b: number) => boolean;
  arp: (s: number, b: number) => boolean;
  arpIdx: (s: number) => number;
  pad: (s: number, b: number) => boolean;
  turnaround: (s: number, b: number) => boolean;
  arpVol: number;
};

export const GROOVES: Record<GrooveName, GroovePreset> = {
  classic: {
    bass: (s) => s === 0 || s === 8,
    bassDur: 1.75,
    sub: (s, b) => s === 0 && b % 2 === 0,
    kick: (s) => s === 0 || s === 8,
    snare: (s) => s === 4 || s === 12,
    hat: (s) => s % 2 === 0,
    hatOpen: (s, b) => s === 6 && b === 7,
    arp: (s) => s % 2 === 0,
    arpIdx: (s) => Math.floor(s / 2),
    pad: (s) => s === 0,
    turnaround: (s, b) => s === 14 && b === 7,
    arpVol: 1,
  },
  driving: {
    bass: (s) => s % 4 === 0,
    bassDur: 0.95,
    sub: (s) => s === 0,
    kick: (s) => s % 4 === 0,
    snare: (s) => s === 4 || s === 12,
    hat: (s) => s % 2 === 0,
    hatOpen: (s, b) => s === 14 && b === 3,
    arp: (s) => s % 2 === 0,
    arpIdx: (s) => Math.floor(s / 2),
    pad: (s) => s === 0,
    turnaround: (s, b) => (b === 3 || b === 7) && s === 14,
    arpVol: 0.9,
  },
  anthem: {
    bass: (s) => s === 0 || s === 6 || s === 8 || s === 14,
    bassDur: 1.5,
    sub: (s) => s === 0,
    kick: (s) => s === 0 || s === 8 || s === 14,
    snare: (s) => s === 4 || s === 12 || s === 14,
    hat: (s) => s % 2 === 0,
    hatOpen: (s, b) => s === 6 || (s === 14 && b === 7),
    arp: (s) => s % 2 === 0,
    arpIdx: (s) => Math.floor(s / 2),
    pad: (s) => s === 0,
    turnaround: (s, b) => b === 7 && (s === 13 || s === 14 || s === 15),
    arpVol: 0.85,
  },
  ambient: {
    bass: (s) => s === 0,
    bassDur: 4.0,
    sub: (s) => s === 0,
    kick: (s, b) => s === 0 && b === 0,
    snare: () => false,
    hat: () => false,
    hatOpen: () => false,
    arp: (s) => s === 0 || s === 8,
    arpIdx: (s) => (s === 0 ? 0 : 4),
    pad: (s) => s === 0,
    turnaround: () => false,
    arpVol: 0.5,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// AUDIO CONTEXT FACTORY
// ─────────────────────────────────────────────────────────────────────────────

type WindowWithWebkit = Window & typeof globalThis & {
  webkitAudioContext?: typeof AudioContext;
};

export function makeAudio(): Audio {
  const w = window as WindowWithWebkit;
  const Ctx = w.AudioContext || w.webkitAudioContext;
  if (!Ctx) throw new Error('Web Audio not supported');
  const ctx = new Ctx();

  const master = ctx.createGain();
  master.gain.value = 0;

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

  // Route everything through `master` so volume / mute control the wet
  // signal too. Previously reverbReturn connected straight to comp,
  // which meant setting master.gain=0 silenced the dry signal but the
  // reverb tail kept playing — sounded like the slider didn't work.
  reverbReturn.connect(master);
  master.connect(comp);
  comp.connect(ctx.destination);

  return { ctx, master, reverbSend };
}

// ─────────────────────────────────────────────────────────────────────────────
// VOICES
// ─────────────────────────────────────────────────────────────────────────────

export function vLead(audio: Audio, freq: number, time: number, dur: number, mode: LeadMode = 'classic'): void {
  const { ctx, master, reverbSend } = audio;

  if (mode === 'classic') {
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
  } else if (mode === 'dark') {
    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    const shaper = ctx.createWaveShaper();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();

    const samples = 1024;
    const curve = new Float32Array(samples);
    const k = 8;
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = ((1 + k) * x) / (1 + k * Math.abs(x));
    }
    shaper.curve = curve;
    shaper.oversample = '2x';

    o1.type = 'sawtooth'; o2.type = 'sawtooth';
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
  } else if (mode === 'anthem') {
    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const o3 = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    o1.type = 'square'; o2.type = 'square'; o3.type = 'sawtooth';
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
  } else {
    // ambient
    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const gain = ctx.createGain();

    o1.type = 'sine'; o2.type = 'triangle';
    o1.frequency.value = freq; o2.frequency.value = freq;

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

    const extraRev = ctx.createGain();
    extraRev.gain.value = 1.6;
    gain.connect(extraRev).connect(reverbSend);

    o1.start(time); o2.start(time);
    o1.stop(time + dur + 0.2); o2.stop(time + dur + 0.2);
  }
}

export function vCounter(audio: Audio, freq: number, time: number, dur: number, mode: LeadMode = 'classic'): void {
  const { ctx, master, reverbSend } = audio;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  if (mode === 'dark') { osc.type = 'sawtooth'; filter.frequency.value = 1100; }
  else if (mode === 'anthem') { osc.type = 'square'; filter.frequency.value = 4000; }
  else if (mode === 'ambient') { osc.type = 'sine'; filter.frequency.value = 3000; }
  else { osc.type = 'triangle'; filter.frequency.value = 1800; }

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

export function vBass(audio: Audio, freq: number, time: number, dur: number): void {
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

export function vSub(audio: Audio, freq: number, time: number, dur: number): void {
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

export function vArp(audio: Audio, freq: number, time: number, vol = 1): void {
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

export function vPad(audio: Audio, freq: number, time: number, dur: number, mode: LeadMode): void {
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

export function vKick(audio: Audio, time: number, vol = 1): void {
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

export function vSnare(audio: Audio, time: number, vol = 1): void {
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

export function vHat(audio: Audio, time: number, open = false): void {
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

// ─────────────────────────────────────────────────────────────────────────────
// SCHEDULER
// ─────────────────────────────────────────────────────────────────────────────

export type Song = {
  id: string;
  title: string;
  bpm: number;
  bars: number;
  progression: ChordName[];
  leadMode: LeadMode;
  groove: GrooveName;
  melody: MelodyDict;
  counter: MelodyDict;
};

export function scheduleStep(audio: Audio, song: Song, stepInLoop: number, time: number): void {
  const bar = Math.floor(stepInLoop / STEPS_PER_BAR);
  const stepInBar = stepInLoop % STEPS_PER_BAR;
  const chord = song.progression[bar];
  const groove = GROOVES[song.groove];
  const beatSec = 60 / song.bpm;

  if (groove.pad(stepInBar, bar)) {
    TRIAD[chord].forEach((n) => vPad(audio, f(n), time, 4 * beatSec, song.leadMode));
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
      vLead(audio, f(pitch), time, dur * beatSec, song.leadMode),
    );
  }
  if (song.counter[stepInLoop]) {
    song.counter[stepInLoop].forEach(({ pitch, dur }) =>
      vCounter(audio, f(pitch), time, dur * beatSec, song.leadMode),
    );
  }
}
