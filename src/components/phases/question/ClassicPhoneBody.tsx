'use client';

import { useState } from 'react';
import { C } from '@/styles/palette';
import type { ClassicQuestion } from '@/data/questions';

const TAGS = ['A', 'B', 'C', 'D'];
const COLORS = [C.pink, C.cyan, C.green, C.yellow];

type Props = {
  q: ClassicQuestion;
  onLock: (idx: number) => void;
  disabled?: boolean;
};

export function ClassicPhoneBody({ q, onLock, disabled }: Props) {
  const [submitting, setSubmitting] = useState<number | null>(null);

  const tap = (i: number) => {
    if (disabled || submitting != null) return;
    setSubmitting(i);
    onLock(i);
  };

  return (
    <div className="grid grid-cols-2 gap-2 h-full">
      {q.options.map((opt, i) => (
        <button
          key={i}
          onClick={() => tap(i)}
          disabled={disabled || submitting != null}
          className="btn-3d font-pixel text-[10px] p-2 leading-tight transition-all min-h-[80px] flex flex-col items-center justify-center gap-1 disabled:opacity-40"
          style={{
            color: COLORS[i],
            background: submitting === i ? COLORS[i] + '22' : '#0a0a0a',
          }}
        >
          <div
            className="w-6 h-6 grid place-items-center font-pixel text-sm"
            style={{ background: COLORS[i], color: '#000' }}
          >
            {TAGS[i]}
          </div>
          <div className="text-white text-center text-[9px]">{opt}</div>
        </button>
      ))}
    </div>
  );
}
