'use client';

import { useEffect, useState } from 'react';
import { Flame } from 'lucide-react';
import { C } from '@/styles/palette';
import { TimerBar } from '@/components/shared/TimerBar';
import { PhoneShell } from '@/components/phases/lobby/PhoneShell';
import { QUESTIONS_BY_ID } from '@/data/questions';
import { useQuestionTimer, PHASE_DURATION_SEC } from '@/lib/game/useQuestionTimer';
import { submitAnswer } from '@/lib/actions/submitAnswer';
import { toPlayer } from '@/lib/game/colorIcon';
import { createClient } from '@/lib/supabase/client';
import { ClassicPhoneBody } from './ClassicPhoneBody';
import { DecryptorPhoneBody } from './DecryptorPhoneBody';
import { LockedPhone } from './LockedPhone';
import type { Database } from '@/lib/database.types';

type PlayerRow = Database['public']['Tables']['players']['Row'];

type QuestionPhoneProps = {
  code: string;
  me: PlayerRow;
  questionId: string;
  startedAt: string | null;
  final?: boolean;
};

export function QuestionPhone({ code, me, questionId, startedAt, final = false }: QuestionPhoneProps) {
  const [locked, setLocked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supabase] = useState(() => createClient());
  const totalSec = final ? PHASE_DURATION_SEC.final_question : PHASE_DURATION_SEC.question;
  const { secondsLeft } = useQuestionTimer(startedAt, totalSec);

  // Check if I've already locked in (e.g. on reload).
  useEffect(() => {
    let cancelled = false;
    supabase
      .from('answers')
      .select('id')
      .eq('player_id', me.id)
      .eq('question_id', questionId)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled && data) setLocked(true);
      });
    return () => {
      cancelled = true;
    };
  }, [me.id, questionId, supabase]);

  const handleLock = async (answer: number | string) => {
    setError(null);
    const result = await submitAnswer({ code, questionId, answer });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setLocked(true);
  };

  if (locked) return <LockedPhone me={me} />;

  const question = QUESTIONS_BY_ID[questionId];
  if (!question) return null;
  const player = toPlayer(me);
  const timerColor = secondsLeft < totalSec * 0.25 ? C.red : C.green;

  return (
    <div className="min-h-screen" style={{ backgroundColor: C.bg }}>
      <PhoneShell you={player} accent={final ? C.purple : C[player.color]}>
        <div className="flex items-center gap-2 mb-3">
          <div className="font-pixel text-[9px] tabular-nums" style={{ color: timerColor }}>
            {Math.ceil(secondsLeft).toString().padStart(2, '0')}s
          </div>
          <div className="flex-1">
            <TimerBar time={secondsLeft} total={totalSec} ominous />
          </div>
          {final && <Flame size={14} style={{ color: C.purple }} className="warning-pulse" />}
        </div>

        <div className="font-pixel text-[10px] text-zinc-400 mb-3 leading-relaxed">
          {question.prompt}
        </div>

        {question.type === 'classic' && (
          <ClassicPhoneBody q={question} onLock={handleLock} disabled={locked} />
        )}
        {question.type === 'decryptor' && (
          <DecryptorPhoneBody onLock={handleLock} disabled={locked} />
        )}

        {error && (
          <div className="font-pixel text-xs text-center mt-3" style={{ color: C.red }}>
            ✗ {error}
          </div>
        )}
      </PhoneShell>
    </div>
  );
}
