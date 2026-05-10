'use client';

import { C } from '@/styles/palette';
import { useRoomChannel } from '@/lib/realtime/useRoomChannel';
import { LobbyPhone } from '@/components/phases/lobby/LobbyPhone';
import { IntroPhone } from '@/components/phases/intro/IntroPhone';
import { QuestionPhone } from '@/components/phases/question/QuestionPhone';
import { ResultPhone } from '@/components/phases/reveal/ResultPhone';
import { MainframeIntroPhone } from '@/components/phases/mainframe/MainframeIntroPhone';
import { WagerPhone } from '@/components/phases/wager/WagerPhone';
import { GameOverPhone } from '@/components/phases/game_over/GameOverPhone';

type Props = {
  code: string;
  playerId: string;
};

export function PhonePhaseRouter({ code, playerId }: Props) {
  const { room, players } = useRoomChannel(code);
  const me = players.find((p) => p.id === playerId);

  if (!room || !me) {
    return (
      <div className="min-h-screen grid place-items-center" style={{ backgroundColor: C.bg }}>
        <div className="font-pixel text-xs text-zinc-500">CONNECTING…</div>
      </div>
    );
  }

  const totalRounds = (room.questions as string[]).length + 1;
  const currentNormalId = (room.questions as string[])[room.current_question_idx];

  switch (room.phase) {
    case 'lobby':
      return <LobbyPhone code={code} playerId={playerId} />;
    case 'intro':
      return (
        <IntroPhone me={me} roundIndex={room.current_question_idx} totalRounds={totalRounds} />
      );
    case 'question':
      return (
        <QuestionPhone
          code={code}
          me={me}
          questionId={currentNormalId}
          startedAt={room.question_started_at}
        />
      );
    case 'reveal':
      return <ResultPhone me={me} questionId={currentNormalId} />;
    case 'mainframe_intro':
      return <MainframeIntroPhone me={me} />;
    case 'wager':
      return <WagerPhone code={code} me={me} startedAt={room.question_started_at} />;
    case 'final_question':
      return (
        <QuestionPhone
          code={code}
          me={me}
          questionId={room.mainframe_question_id ?? ''}
          startedAt={room.question_started_at}
          final
        />
      );
    case 'final_reveal':
      return <ResultPhone me={me} questionId={room.mainframe_question_id ?? ''} final />;
    case 'game_over':
      return <GameOverPhone code={code} me={me} />;
    default:
      return (
        <div className="min-h-screen grid place-items-center" style={{ backgroundColor: C.bg }}>
          <div className="font-pixel text-xs text-zinc-500">UNKNOWN PHASE: {room.phase}</div>
        </div>
      );
  }
}
