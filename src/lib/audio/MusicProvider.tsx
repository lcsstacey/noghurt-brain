'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useTheme, type UseThemeResult } from './useTheme';
import { songForPhase, type GamePhase, type SongId } from './songs';

/**
 * Owns the AudioContext singleton AND the current "phase" the music
 * should track. Mounted ONCE at the root layout so the audio survives
 * page navigations — solves the "user clicked CREATE ROOM, then navigated
 * to /host, but new page's AudioContext has no recent user gesture so it
 * won't start" problem.
 *
 * Pages call `useMusicPhase('lobby')` (or 'menu', or `room.phase`) to
 * tell the provider what should be playing. /play pages call
 * `useMusicPhase(null)` (or just don't call it) so players' phones stay
 * silent.
 */

export type MusicPhase = GamePhase | 'menu' | null;

const MENU_SONG: SongId = 'deeplink';

type MusicContextValue = {
  phase: MusicPhase;
  setPhase: (p: MusicPhase) => void;
  theme: UseThemeResult;
  /** Whether to render the music UI right now. */
  visible: boolean;
};

const MusicContext = createContext<MusicContextValue | null>(null);

export function MusicProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<MusicPhase>(null);
  const theme = useTheme(MENU_SONG);
  const lastSongIdRef = useRef<SongId>(theme.songId);

  const visible = phase != null;

  // Whenever the requested phase changes (from a page calling setPhase),
  // pick the right song and crossfade to it (only if already playing).
  useEffect(() => {
    if (phase == null) return;
    const target: SongId = phase === 'menu' ? MENU_SONG : songForPhase(phase);
    if (target === lastSongIdRef.current) return;
    lastSongIdRef.current = target;
    if (theme.playing) theme.changeSong(target);
  }, [phase, theme]);

  // Autostart strategy:
  //  1. Try to start as soon as we have a phase set (no-op if already
  //     playing; succeeds if we're already in a recent user gesture).
  //  2. Fall back to a one-time document-level pointerdown / keydown /
  //     touchstart listener that starts on the first interaction. Any
  //     click anywhere on the site unblocks the audio.
  useEffect(() => {
    if (phase == null) return;
    if (theme.playing) return;

    // Pick the right initial song before starting so we don't jump tracks
    // from MENU_SONG on the first beat.
    const target: SongId = phase === 'menu' ? MENU_SONG : songForPhase(phase);
    if (target !== theme.songId) {
      theme.changeSong(target);
      lastSongIdRef.current = target;
    }
    theme.start();
  }, [phase, theme]);

  useEffect(() => {
    if (theme.playing) return;
    if (phase == null) return;

    const startOnFirstGesture = () => {
      const target: SongId = phase === 'menu' ? MENU_SONG : songForPhase(phase);
      if (target !== theme.songId) {
        theme.changeSong(target);
        lastSongIdRef.current = target;
      }
      theme.start();
    };
    window.addEventListener('pointerdown', startOnFirstGesture, { once: true });
    window.addEventListener('keydown', startOnFirstGesture, { once: true });
    window.addEventListener('touchstart', startOnFirstGesture, { once: true });
    return () => {
      window.removeEventListener('pointerdown', startOnFirstGesture);
      window.removeEventListener('keydown', startOnFirstGesture);
      window.removeEventListener('touchstart', startOnFirstGesture);
    };
  }, [phase, theme]);

  const value = useMemo<MusicContextValue>(
    () => ({ phase, setPhase, theme, visible }),
    [phase, theme, visible],
  );

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
}

/** Read full music context — used by MusicController. */
export function useMusic(): MusicContextValue {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error('useMusic must be used inside <MusicProvider>');
  return ctx;
}

/**
 * Pages call this with the phase they want music to track. Setting it
 * to `null` silences the music (e.g. on /play/[code] for player phones).
 *
 * Safe to call from anywhere; the provider keeps the audio alive across
 * page navigations.
 */
export function useMusicPhase(phase: MusicPhase) {
  const { setPhase } = useMusic();
  const stableSet = useCallback((p: MusicPhase) => setPhase(p), [setPhase]);
  useEffect(() => {
    stableSet(phase);
  }, [phase, stableSet]);
}
