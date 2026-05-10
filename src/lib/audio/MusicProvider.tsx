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
  // Wait for an actual user gesture before calling start(). The Web Audio
  // autoplay rule blocks ctx.resume() outside a user gesture, so eagerly
  // calling start() on mount marks the React state as `playing=true`
  // while the AudioContext stays `suspended` — silent forever.
  //
  // Instead: keep the gesture listener attached UNTIL the AudioContext is
  // confirmed `running` (theme.running, distinct from theme.playing). Each
  // gesture re-attempts. Once running, the listener is removed.
  useEffect(() => {
    if (phase == null) return;
    if (theme.running) return;

    const startOnGesture = () => {
      const target: SongId = phase === 'menu' ? MENU_SONG : songForPhase(phase);
      if (target !== theme.songId) {
        theme.changeSong(target);
        lastSongIdRef.current = target;
      }
      theme.start();
    };

    window.addEventListener('pointerdown', startOnGesture);
    window.addEventListener('keydown', startOnGesture);
    window.addEventListener('touchstart', startOnGesture);
    return () => {
      window.removeEventListener('pointerdown', startOnGesture);
      window.removeEventListener('keydown', startOnGesture);
      window.removeEventListener('touchstart', startOnGesture);
    };
  }, [phase, theme.running, theme]);

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
