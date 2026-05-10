'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { C } from '@/styles/palette';
import { hostAdvance } from '@/lib/actions/hostAdvance';
import { PHASE_ADVANCE_MS } from '@/lib/game/useQuestionTimer';

type Props = {
  code: string;
  isHost: boolean;
};

export function MainframeIntroHost({ code, isHost }: Props) {
  const router = useRouter();
  const advanced = useRef(false);

  useEffect(() => {
    if (!isHost || advanced.current) return;
    const id = setTimeout(async () => {
      if (advanced.current) return;
      advanced.current = true;
      const r = await hostAdvance(code);
      if (r.ok) router.refresh();
    }, PHASE_ADVANCE_MS.mainframe_intro);
    return () => clearTimeout(id);
  }, [code, isHost, router]);

  return (
    <div className="h-full grid place-items-center text-center">
      <div className="space-y-4 pixel-pop">
        <div className="font-pixel text-sm" style={{ color: C.red }}>
          ⚠ INCOMING TRANSMISSION ⚠
        </div>
        <div>
          <div
            className="font-pixel text-5xl sm:text-7xl glitch text-glow tracking-wider"
            style={{ color: C.pink }}
          >
            THE
          </div>
          <div className="font-pixel text-6xl sm:text-8xl mt-3 mainframe-bg p-4 inline-block text-black tracking-wider">
            MAINFRAME
          </div>
        </div>
        <div className="font-crt text-2xl mt-4" style={{ color: C.yellow }}>
          ▸ WAGER YOUR POINTS · WIN BIG · LOSE EVERYTHING ▸
        </div>
      </div>
    </div>
  );
}
