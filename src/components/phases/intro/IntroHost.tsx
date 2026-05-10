'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { C } from '@/styles/palette';
import { CATEGORIES } from '@/lib/game/categories';
import { QUESTIONS_BY_ID } from '@/data/questions';
import { hostAdvance } from '@/lib/actions/hostAdvance';
import { PHASE_ADVANCE_MS } from '@/lib/game/useQuestionTimer';

type IntroHostProps = {
  code: string;
  isHost: boolean;
  questionId: string;
  roundIndex: number;
  totalRounds: number;
};

/**
 * Round X/N intro card. Auto-advances after PHASE_ADVANCE_MS.intro
 * (host's browser drives the transition).
 */
export function IntroHost({ code, isHost, questionId, roundIndex, totalRounds }: IntroHostProps) {
  const router = useRouter();
  const advanced = useRef(false);
  const question = QUESTIONS_BY_ID[questionId];
  const cat = question ? CATEGORIES[question.cat] : null;

  useEffect(() => {
    if (!isHost) return;
    if (advanced.current) return;
    const id = setTimeout(async () => {
      if (advanced.current) return;
      advanced.current = true;
      const result = await hostAdvance(code);
      if (result.ok) router.refresh();
    }, PHASE_ADVANCE_MS.intro);
    return () => clearTimeout(id);
  }, [code, isHost, router]);

  if (!question || !cat) return null;
  const Icon = cat.Icon;

  return (
    <div className="h-full grid place-items-center text-center">
      <div className="space-y-4 pixel-pop">
        <div className="font-pixel text-sm text-zinc-500">▶ INCOMING ROUND</div>
        <div className="font-pixel text-7xl text-glow" style={{ color: C.cyan }}>
          {(roundIndex + 1).toString().padStart(2, '0')}
          <span className="text-zinc-700 mx-2">/</span>
          <span className="text-zinc-500">{totalRounds.toString().padStart(2, '0')}</span>
        </div>
        <div className="flex items-center justify-center gap-3 mt-3">
          <Icon size={28} style={{ color: cat.color }} />
          <div className="font-pixel text-base" style={{ color: cat.color }}>
            {cat.name}
          </div>
        </div>
      </div>
    </div>
  );
}
