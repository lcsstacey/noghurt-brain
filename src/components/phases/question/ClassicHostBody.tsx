'use client';

import { Lock } from 'lucide-react';
import { C } from '@/styles/palette';
import type { ClassicQuestion } from '@/data/questions';

const TAGS = ['A', 'B', 'C', 'D'];
const COLORS = [C.pink, C.cyan, C.green, C.yellow];

type Props = {
  q: ClassicQuestion;
  /** When provided, cards are clickable and call this on tap. */
  onLock?: (idx: number) => void;
  /** The current player's locked-in option index (null = not yet locked). */
  myAnswer?: number | null;
  /** Externally disable taps (timer expired, request in flight, etc.). */
  disabled?: boolean;
};

/**
 * The big four answer cards rendered on the desktop "TV" question screen.
 * Same UI for hosts and guests — both tap to lock in. Once locked, the
 * chosen card glows and the others dim; pre-lock all four are equally lit.
 */
export function ClassicHostBody({ q, onLock, myAnswer, disabled }: Props) {
  const locked = myAnswer != null;
  const interactive = !!onLock && !locked && !disabled;

  return (
    <div className="grid grid-cols-2 gap-3">
      {q.options.map((opt, i) => {
        const mine = myAnswer === i;
        const dim = locked && !mine;
        return (
          <button
            key={i}
            type="button"
            onClick={() => interactive && onLock?.(i)}
            disabled={!interactive}
            aria-pressed={mine}
            className="font-pixel text-xs sm:text-sm p-3 border-2 flex items-center gap-3 text-left transition-all enabled:hover:brightness-125 disabled:cursor-default"
            style={{
              borderColor: mine ? COLORS[i] : COLORS[i] + (dim ? '33' : '88'),
              color: COLORS[i],
              background: mine ? COLORS[i] + '22' : '#000',
              boxShadow: mine
                ? `0 0 18px ${COLORS[i]}99, inset 0 0 12px ${COLORS[i]}44`
                : 'none',
              opacity: dim ? 0.45 : 1,
            }}
          >
            <div
              className="w-7 h-7 grid place-items-center font-pixel text-base shrink-0"
              style={{ background: COLORS[i], color: '#000' }}
            >
              {TAGS[i]}
            </div>
            <span className="text-white text-glow-soft flex-1">{opt}</span>
            {mine && <Lock size={14} style={{ color: COLORS[i] }} />}
          </button>
        );
      })}
    </div>
  );
}
