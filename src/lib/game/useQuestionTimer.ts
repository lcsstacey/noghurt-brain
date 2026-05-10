'use client';

import { useEffect, useState } from 'react';

/**
 * Server-authoritative timer. Reads `started_at` (ISO string from
 * rooms.question_started_at) and counts down `durationSec`.
 *
 * Polls every 100ms. Clients refresh mid-question and don't reset because
 * the start time comes from the server.
 *
 * Returns secondsLeft as a float for smooth bar animation; consumers that
 * want a whole-second display should `Math.ceil()` it.
 */
export function useQuestionTimer(
  startedAt: string | null,
  durationSec: number,
): { secondsLeft: number; isExpired: boolean } {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!startedAt) return;
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, [startedAt]);

  if (!startedAt) {
    return { secondsLeft: durationSec, isExpired: false };
  }

  const elapsedSec = Math.max(0, (now - new Date(startedAt).getTime()) / 1000);
  const secondsLeft = Math.max(0, durationSec - elapsedSec);
  return { secondsLeft, isExpired: secondsLeft <= 0 };
}

/** Phase durations in seconds. Source of truth — used by both timer + auto-advance. */
export const PHASE_DURATION_SEC = {
  question: 15,
  wager: 12,
  final_question: 18,
} as const;

/**
 * Per-difficulty question timer. NIGHTMARE shaves 5s off normal questions
 * for the "Faster · Harder" feel; the wager + final question timers stay
 * unchanged (they're already on a tighter schedule).
 */
export function questionDuration(
  difficulty: 'normal' | 'nightmare' | undefined,
  isFinal: boolean,
): number {
  if (isFinal) return PHASE_DURATION_SEC.final_question;
  return difficulty === 'nightmare' ? 10 : PHASE_DURATION_SEC.question;
}

/** Auto-advance delays in milliseconds. */
export const PHASE_ADVANCE_MS = {
  intro: 1400,
  reveal: 5500,
  mainframe_intro: 3200,
  final_reveal: 6500,
  // Question/wager use server timer + a small grace period for grading.
  questionGrace: 300,
} as const;
