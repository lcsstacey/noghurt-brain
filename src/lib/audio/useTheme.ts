'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  makeAudio,
  scheduleStep,
  STEPS_PER_BAR,
  STEPS_PER_BEAT,
  type Audio,
} from './engine';
import { SONGS, type SongId } from './songs';

const SCHEDULE_AHEAD_SEC = 0.12;
const TICK_MS = 25;
const FADE_SEC = 0.05;

export type UseThemeResult = {
  songId: SongId;
  playing: boolean;
  vol: number;
  muted: boolean;
  /** Initialize audio context (must come from a user gesture) and start playback. */
  start: () => void;
  /** Pause and ramp master gain to 0; safe to call when not playing. */
  stop: () => void;
  /** Crossfade-switch the active song. Restarts at bar 1 of the new track. */
  changeSong: (id: SongId) => void;
  setVol: (v: number) => void;
  toggleMute: () => void;
};

/**
 * Web Audio chiptune player. Single React hook owns the AudioContext singleton
 * for this client. Per Web Audio autoplay rules, `start()` MUST be invoked
 * inside a user-gesture handler (click/tap), otherwise the context will be
 * suspended and silent.
 */
export function useTheme(initial: SongId = 'mainframe'): UseThemeResult {
  const [songId, setSongId] = useState<SongId>(initial);
  const [playing, setPlaying] = useState(false);
  const [vol, setVolState] = useState(0.5);
  const [muted, setMuted] = useState(false);

  const audioRef = useRef<Audio | null>(null);
  const songRef = useRef(SONGS[initial]);
  const stateRef = useRef<{ next: number; current: number; handle: ReturnType<typeof setTimeout> | null }>({
    next: 0,
    current: 0,
    handle: null,
  });

  useEffect(() => {
    songRef.current = SONGS[songId];
  }, [songId]);

  const tick = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const song = songRef.current;
    const stepSec = 60 / song.bpm / STEPS_PER_BEAT;
    const loopSteps = song.bars * STEPS_PER_BAR;

    while (stateRef.current.next < audio.ctx.currentTime + SCHEDULE_AHEAD_SEC) {
      scheduleStep(audio, song, stateRef.current.current % loopSteps, stateRef.current.next);
      stateRef.current.next += stepSec;
      stateRef.current.current++;
    }
    stateRef.current.handle = setTimeout(tick, TICK_MS);
  }, []);

  const ensureAudio = useCallback((): Audio | null => {
    try {
      if (!audioRef.current) audioRef.current = makeAudio();
      const a = audioRef.current;
      if (a.ctx.state === 'suspended') void a.ctx.resume();
      return a;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[useTheme] audio init failed', e);
      return null;
    }
  }, []);

  const start = useCallback(() => {
    const audio = ensureAudio();
    if (!audio) return;
    audio.master.gain.cancelScheduledValues(audio.ctx.currentTime);
    audio.master.gain.linearRampToValueAtTime(muted ? 0 : vol, audio.ctx.currentTime + FADE_SEC);
    stateRef.current.next = audio.ctx.currentTime + 0.1;
    stateRef.current.current = 0;
    if (stateRef.current.handle) clearTimeout(stateRef.current.handle);
    setPlaying(true);
    tick();
  }, [ensureAudio, muted, vol, tick]);

  const stop = useCallback(() => {
    if (stateRef.current.handle) {
      clearTimeout(stateRef.current.handle);
      stateRef.current.handle = null;
    }
    const a = audioRef.current;
    if (a) {
      a.master.gain.cancelScheduledValues(a.ctx.currentTime);
      a.master.gain.linearRampToValueAtTime(0, a.ctx.currentTime + 0.1);
    }
    setPlaying(false);
  }, []);

  const changeSong = useCallback(
    (newId: SongId) => {
      if (newId === songId) return;
      songRef.current = SONGS[newId];
      setSongId(newId);
      const a = audioRef.current;
      if (stateRef.current.handle && a) {
        a.master.gain.cancelScheduledValues(a.ctx.currentTime);
        a.master.gain.linearRampToValueAtTime(0, a.ctx.currentTime + 0.05);
        a.master.gain.linearRampToValueAtTime(muted ? 0 : vol, a.ctx.currentTime + 0.15);
        stateRef.current.next = a.ctx.currentTime + 0.15;
        stateRef.current.current = 0;
      }
    },
    [songId, vol, muted],
  );

  // Live-sync volume + mute to master gain.
  useEffect(() => {
    const a = audioRef.current;
    if (!a || !playing) return;
    a.master.gain.cancelScheduledValues(a.ctx.currentTime);
    a.master.gain.linearRampToValueAtTime(muted ? 0 : vol, a.ctx.currentTime + 0.05);
  }, [vol, muted, playing]);

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      if (stateRef.current.handle) {
        clearTimeout(stateRef.current.handle);
        stateRef.current.handle = null;
      }
      const a = audioRef.current;
      if (a) {
        try {
          void a.ctx.close();
        } catch {
          // ignore
        }
        audioRef.current = null;
      }
    };
  }, []);

  const toggleMute = useCallback(() => setMuted((m) => !m), []);

  return {
    songId,
    playing,
    vol,
    muted,
    start,
    stop,
    changeSong,
    setVol: setVolState,
    toggleMute,
  };
}
