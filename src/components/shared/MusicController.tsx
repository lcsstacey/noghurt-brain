'use client';

import { useEffect, useRef } from 'react';
import { Music, Volume2, VolumeX } from 'lucide-react';
import { C } from '@/styles/palette';
import { useTheme } from '@/lib/audio/useTheme';
import { songForPhase, type GamePhase } from '@/lib/audio/songs';

type Props = {
  phase: GamePhase;
};

/**
 * Floating music toggle for the host TV. Phase-aware: clicking it once
 * starts the audio context (required by browser autoplay rules) and the
 * music auto-switches as the room.phase changes. Subsequent clicks
 * mute / unmute.
 *
 * Renders nothing on the player phone view (mounted only in HostPhaseRouter).
 */
export function MusicController({ phase }: Props) {
  const theme = useTheme(songForPhase(phase));
  const lastSongId = useRef(theme.songId);

  // Auto-switch song when phase changes (only once playing).
  useEffect(() => {
    const target = songForPhase(phase);
    if (target !== lastSongId.current) {
      lastSongId.current = target;
      if (theme.playing) theme.changeSong(target);
    }
  }, [phase, theme]);

  const handleClick = () => {
    if (!theme.playing) {
      theme.start();
      return;
    }
    theme.toggleMute();
  };

  const accent = theme.playing && !theme.muted ? C.cyan : '#52525b';
  const Icon = !theme.playing ? Music : theme.muted ? VolumeX : Volume2;
  const label = !theme.playing
    ? 'MUSIC OFF · CLICK TO START'
    : theme.muted
      ? 'MUTED · CLICK TO UNMUTE'
      : 'PLAYING';

  return (
    <button
      type="button"
      onClick={handleClick}
      className="fixed bottom-4 right-4 z-50 btn-3d font-pixel text-[10px] px-3 py-2 bg-black flex items-center gap-2"
      style={{ color: accent }}
      aria-label={label}
      title={label}
    >
      <Icon size={14} />
      <span className="hidden sm:inline">{theme.playing ? theme.songId.toUpperCase() : 'MUSIC'}</span>
    </button>
  );
}
