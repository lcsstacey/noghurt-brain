'use client';

import { useMemo } from 'react';
import { C } from '@/styles/palette';
import type { DecryptorQuestion } from '@/data/questions';

type Props = {
  q: DecryptorQuestion;
  /** seconds remaining; from useQuestionTimer */
  secondsLeft: number;
  /** total duration in seconds */
  totalSec: number;
};

/**
 * Progressively reveals up to 50% of the answer's letters as the timer
 * counts down. Reveal order is deterministic (LCG seeded by q.id) so the
 * same question always reveals the same letters first.
 */
export function DecryptorHostBody({ q, secondsLeft, totalSec }: Props) {
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

  return (
    <div className="space-y-3">
      <div className="font-pixel text-[9px] text-zinc-500 text-center">▸ DECRYPTING SIGNAL…</div>
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
    </div>
  );
}
