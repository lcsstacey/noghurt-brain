'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, KeyRound, Power, Radio, X } from 'lucide-react';
import { C } from '@/styles/palette';
import { createRoom } from '@/lib/actions/createRoom';
import { normalizeCode } from '@/lib/game/code';
import { useMusicPhase } from '@/lib/audio/MusicProvider';

export default function LandingPage() {
  const router = useRouter();
  const [showJoin, setShowJoin] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isCreating, startCreating] = useTransition();

  // Tells the global MusicProvider to play the menu track.
  useMusicPhase('menu');

  const handleCreate = () => {
    setError(null);
    startCreating(async () => {
      const result = await createRoom();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(`/host/${result.code}`);
    });
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 4) return;
    router.push(`/play/${code}`);
  };

  return (
    <main
      className="relative min-h-screen overflow-hidden scanlines vignette"
      style={{ backgroundColor: C.bg }}
    >
      <div className="bg-grid absolute inset-0 opacity-50" />
      <div className="scan-line" />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-between p-6 sm:p-10 gap-10">
        <div className="font-pixel text-[10px] text-zinc-500 flex items-center gap-2">
          <Radio
            size={10}
            className="animate-pulse"
            style={{ color: C.green }}
            aria-hidden="true"
          />
          <span>SYS:// AWAITING SIGNAL</span>
          <span className="blink" style={{ color: C.green }} aria-hidden="true">
            ▓
          </span>
        </div>

        <div className="flex flex-col items-center gap-8 sm:gap-10 text-center">
          <h1
            className="font-pixel text-5xl sm:text-7xl glitch-slow leading-tight"
            style={{ color: C.pink }}
          >
            NOGHURT
            <br />
            <span style={{ color: C.cyan }}>BRAIN</span>
          </h1>

          <p
            className="font-crt text-xl sm:text-2xl max-w-md leading-snug"
            style={{ color: C.green }}
          >
            Multiplayer trivia. Cyberpunk vibes. Bring your phone.
          </p>

          <div className="flex flex-col gap-4 w-full max-w-xs">
            <button
              type="button"
              onClick={handleCreate}
              disabled={isCreating}
              className="btn-3d font-pixel text-base py-4 px-6 flex items-center justify-center gap-3 bg-black disabled:opacity-50"
              style={{ color: C.pink }}
            >
              <Power size={18} className={isCreating ? 'warning-pulse' : ''} />
              {isCreating ? 'INITIALIZING…' : 'CREATE ROOM'}
              <ChevronRight size={18} />
            </button>

            {!showJoin ? (
              <button
                type="button"
                onClick={() => setShowJoin(true)}
                className="btn-3d font-pixel text-base py-4 px-6 flex items-center justify-center gap-3 bg-black"
                style={{ color: C.cyan }}
              >
                <KeyRound size={18} />
                JOIN WITH CODE
              </button>
            ) : (
              <form onSubmit={handleJoinSubmit} className="flex flex-col gap-3">
                <label htmlFor="room-code" className="sr-only">
                  Room code
                </label>
                <input
                  id="room-code"
                  value={code}
                  onChange={(e) => setCode(normalizeCode(e.target.value))}
                  maxLength={4}
                  autoCapitalize="characters"
                  spellCheck={false}
                  autoFocus
                  placeholder="????"
                  className="font-pixel text-3xl text-center py-4 bg-black border-2 tracking-[0.3em] retro-input"
                  style={{ borderColor: C.cyan, color: C.cyan }}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowJoin(false);
                      setCode('');
                    }}
                    className="btn-3d font-pixel text-sm py-3 px-4 bg-black flex-shrink-0"
                    style={{ color: '#52525b' }}
                    aria-label="Cancel"
                  >
                    <X size={16} />
                  </button>
                  <button
                    type="submit"
                    disabled={code.length !== 4}
                    className="btn-3d font-pixel text-sm py-3 px-6 bg-black flex-1 disabled:opacity-40"
                    style={{ color: C.cyan }}
                  >
                    CONNECT
                  </button>
                </div>
              </form>
            )}

            {error && (
              <div
                className="font-pixel text-xs text-center mt-2"
                style={{ color: C.red }}
              >
                ✗ {error}
              </div>
            )}
          </div>
        </div>

        <div className="font-crt text-base text-zinc-600 flex items-center gap-2">
          <span className="blink" style={{ color: C.green }} aria-hidden="true">
            ▓
          </span>
          <span>© 2026 NOGHURT BRAIN · v0.1.0</span>
        </div>
      </div>
    </main>
  );
}
