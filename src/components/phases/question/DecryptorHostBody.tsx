'use client';

import { useMemo, useState } from 'react';
import { Lock } from 'lucide-react';
import { C } from '@/styles/palette';
import type { DecryptorQuestion } from '@/data/questions';

type Props = {
  q: DecryptorQuestion;
  /** seconds remaining; from useQuestionTimer */
  secondsLeft: number;
  /** total duration in seconds */
  totalSec: number;
  /** When provided, the input form is enabled and calls this on submit. */
  onLock?: (answer: string) => void;
  /** The current player's locked-in answer (null = not yet locked). */
  myAnswer?: string | null;
  /** Externally disable input (e.g. timer expired). */
  disabled?: boolean;
};

/**
 * Progressive letter-reveal animation up top, plus a typed-input lock-in
 * form below. Everyone (host + guests) sees the same UI on desktop.
 *
 * Reveal order is deterministic (LCG seeded by q.id) so the same question
 * always reveals the same letters first.
 */
export function DecryptorHostBody({
  q,
  secondsLeft,
  totalSec,
  onLock,
  myAnswer,
  disabled,
}: Props) {
  const revealOrder = useMemo(() => {
    const indices = q.answer
      .split('')
      .map((c, i) => ({ c, i }))
      .filter((x) => x.c !== ' ')
      .map((x) => x.i);
    let s = 0;
    for (const ch of q.id) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
    return indices.sort(() => {
      s = (s * 1103515245 + 12345) >>> 0;
      return s % 2 ? 1 : -1;
    });
  }, [q.id, q.answer]);

  const elapsed = totalSec - secondsLeft;
  const ratio = Math.max(0, Math.min(1, elapsed / totalSec));
  const revealCount = Math.floor(ratio * revealOrder.length * 0.5);
  const revealedSet = new Set(revealOrder.slice(0, revealCount));

  const words = q.answer.split(' ');
  const locked = myAnswer != null;

  const [val, setVal] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const interactive = !!onLock && !locked && !disabled;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!interactive || !val.trim() || submitting) return;
    setSubmitting(true);
    onLock?.(val);
  };

  return (
    <div className="space-y-4">
      <div className="font-pixel text-[9px] text-zinc-500 text-center">
        ▸ DECRYPTING SIGNAL…
      </div>
      <div className="flex flex-wrap gap-3 justify-center">
        {words.map((word, wi) => {
          const wordOffset = words.slice(0, wi).reduce((a, w) => a + w.length + 1, 0);
          return (
            <div key={wi} className="flex gap-1">
              {word.split('').map((ch, i) => {
                const globalIdx = wordOffset + i;
                const revealed = revealedSet.has(globalIdx);
                return (
                  <div
                    key={i}
                    className="w-7 h-10 sm:w-8 sm:h-11 grid place-items-center font-pixel text-sm sm:text-base border-2 transition-all"
                    style={{
                      borderColor: revealed ? C.green : '#3f3f46',
                      color: revealed ? C.green : '#52525b',
                      background: revealed ? '#0a1f0a' : '#0a0a0a',
                      boxShadow: revealed ? `0 0 8px ${C.green}66` : 'none',
                    }}
                  >
                    {revealed ? ch : '█'}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {locked ? (
        <div
          className="border-2 px-3 py-2 flex items-center justify-center gap-2"
          style={{ borderColor: C.green, background: 'rgba(57,255,20,0.06)' }}
        >
          <Lock size={14} style={{ color: C.green }} />
          <span className="font-pixel text-xs" style={{ color: C.green }}>
            LOCKED IN: <span className="text-white">{myAnswer}</span>
          </span>
        </div>
      ) : (
        onLock && (
          <form onSubmit={handleSubmit} className="grid grid-cols-[1fr_auto] gap-2">
            <input
              value={val}
              onChange={(e) => setVal(e.target.value)}
              disabled={!interactive || submitting}
              placeholder="ENTER ANSWER…"
              className="retro-input w-full px-3 py-2 bg-black border-2 font-pixel text-sm uppercase disabled:opacity-50"
              style={{ borderColor: C.green, color: C.green, caretColor: C.green }}
            />
            <button
              type="submit"
              disabled={!interactive || !val.trim() || submitting}
              className="btn-3d font-pixel text-xs px-4 py-2 disabled:opacity-30"
              style={{ color: C.pink, background: '#0a0a0a' }}
            >
              <span className="flex items-center justify-center gap-2">
                <Lock size={12} />
                {submitting ? 'LOCKING…' : 'LOCK IN'}
              </span>
            </button>
          </form>
        )
      )}
    </div>
  );
}
