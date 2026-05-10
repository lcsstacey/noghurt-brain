'use client';

import { useEffect, useRef, useState } from 'react';
import { Music, Volume2, VolumeX } from 'lucide-react';
import { C } from '@/styles/palette';
import { useTheme } from '@/lib/audio/useTheme';
import { songForPhase, SONGS, type GamePhase, type SongId } from '@/lib/audio/songs';

type Props = {
  /** Game phase, or 'menu' for the landing page (plays DEEP_LINK ambient). */
  phase: GamePhase | 'menu';
};

const MENU_SONG: SongId = 'deeplink';

/**
 * Floating music controller — mounted on the host TV view AND the landing
 * page menu. Phase-aware: clicking it once starts the audio context (Web
 * Audio autoplay rule needs a user gesture) and the song auto-switches as
 * room.phase changes. Includes inline mute toggle + volume slider.
 *
 * Players' phones never mount this — 8 unsynced playheads on a Discord
 * call would be cacophony.
 */
export function MusicController({ phase }: Props) {
  const initialSong: SongId = phase === 'menu' ? MENU_SONG : songForPhase(phase);
  const theme = useTheme(initialSong);
  const lastSongId = useRef(theme.songId);
  const [expanded, setExpanded] = useState(false);

  // Auto-switch song when phase changes (only once playing).
  useEffect(() => {
    const target: SongId = phase === 'menu' ? MENU_SONG : songForPhase(phase);
    if (target !== lastSongId.current) {
      lastSongId.current = target;
      if (theme.playing) theme.changeSong(target);
    }
  }, [phase, theme]);

  const handleIconClick = () => {
    if (!theme.playing) {
      theme.start();
      setExpanded(true);
      return;
    }
    theme.toggleMute();
  };

  const accent = theme.playing && !theme.muted ? C.cyan : '#52525b';
  const Icon = !theme.playing ? Music : theme.muted ? VolumeX : Volume2;
  const trackTitle = SONGS[theme.songId].title;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-black border-2 px-3 py-2"
      style={{ borderColor: accent + '88' }}
      onMouseEnter={() => theme.playing && setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <button
        type="button"
        onClick={handleIconClick}
        className="flex items-center gap-2 font-pixel text-[10px]"
        style={{ color: accent }}
        aria-label={!theme.playing ? 'Start music' : theme.muted ? 'Unmute' : 'Mute'}
      >
        <Icon size={14} />
        {!theme.playing && <span className="hidden sm:inline">START MUSIC</span>}
        {theme.playing && !expanded && (
          <span className="hidden sm:inline">{theme.muted ? 'MUTED' : trackTitle}</span>
        )}
      </button>

      {theme.playing && expanded && (
        <>
          <div className="font-pixel text-[8px] hidden sm:block" style={{ color: accent }}>
            {trackTitle}
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={theme.vol}
            onChange={(e) => theme.setVol(parseFloat(e.target.value))}
            className="w-24 accent-cyan-400"
            aria-label="Volume"
          />
          <span className="font-pixel text-[8px] tabular-nums" style={{ color: accent }}>
            {Math.round(theme.vol * 100)}
          </span>
        </>
      )}
    </div>
  );
}
