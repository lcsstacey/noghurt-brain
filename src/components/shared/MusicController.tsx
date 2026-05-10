'use client';

import { useState } from 'react';
import { Music, Volume2, VolumeX } from 'lucide-react';
import { C } from '@/styles/palette';
import { useMusic } from '@/lib/audio/MusicProvider';
import { SONGS } from '@/lib/audio/songs';

/**
 * Floating bottom-right music UI. Reads from the global MusicProvider.
 * Hidden when no phase is set (e.g. on /play/[code] phone routes).
 *
 * The audio engine itself lives in the provider at the root layout, so
 * navigations don't kill the AudioContext.
 */
export function MusicController() {
  const { theme, visible } = useMusic();
  const [expanded, setExpanded] = useState(false);

  if (!visible) return null;

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
        {!theme.playing && <span className="hidden sm:inline">CLICK ANYWHERE</span>}
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
