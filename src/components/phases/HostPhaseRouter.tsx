'use client';

import { C } from '@/styles/palette';
import { HostFrame } from '@/components/chrome/HostFrame';
import { useRoomChannel } from '@/lib/realtime/useRoomChannel';
import { LobbyHost } from '@/components/phases/lobby/LobbyHost';
import { IntroHost } from '@/components/phases/intro/IntroHost';
import { QuestionHost } from '@/components/phases/question/QuestionHost';
import { RevealHost } from '@/components/phases/reveal/RevealHost';
import { MainframeIntroHost } from '@/components/phases/mainframe/MainframeIntroHost';
import { WagerHost } from '@/components/phases/wager/WagerHost';
import { GameOverHost } from '@/components/phases/game_over/GameOverHost';

type Props = {
  code: string;
  isHost: boolean;
  joinUrl: string;
};

/**
 * Single client component that subscribes to the room and renders the
 * phase-appropriate host view. Centralizing here means realtime phase
 * changes propagate instantly without router.refresh round-trips.
 */
export function HostPhaseRouter({ code, isHost, joinUrl }: Props) {
  const { room } = useRoomChannel(code);

  if (!room) {
    return (
      <div className="min-h-screen grid place-items-center" style={{ backgroundColor: C.bg }}>
        <div className="font-pixel text-xs text-zinc-500">CONNECTING…</div>
      </div>
    );
  }

  const totalRounds = (room.questions as string[]).length + 1; // normal + 1 mainframe
  const currentNormalId = (room.questions as string[])[room.current_question_idx];

  let content;
  switch (room.phase) {
    case 'lobby':
      content = <LobbyHost code={code} joinUrl={joinUrl} />;
      break;
    case 'intro':
      content = (
        <IntroHost
          code={code}
          isHost={isHost}
          questionId={currentNormalId}
          roundIndex={room.current_question_idx}
          totalRounds={totalRounds}
        />
      );
      break;
    case 'question':
      content = (
        <QuestionHost
          code={code}
          isHost={isHost}
          questionId={currentNormalId}
          roundIndex={room.current_question_idx}
          totalRounds={totalRounds}
          startedAt={room.question_started_at}
        />
      );
      break;
    case 'reveal':
      content = <RevealHost code={code} isHost={isHost} questionId={currentNormalId} />;
      break;
    case 'mainframe_intro':
      content = <MainframeIntroHost code={code} isHost={isHost} />;
      break;
    case 'wager':
      content = (
        <WagerHost
          code={code}
          isHost={isHost}
          mainframeQuestionId={room.mainframe_question_id ?? ''}
          startedAt={room.question_started_at}
        />
      );
      break;
    case 'final_question':
      content = (
        <QuestionHost
          code={code}
          isHost={isHost}
          questionId={room.mainframe_question_id ?? ''}
          roundIndex={(room.questions as string[]).length}
          totalRounds={totalRounds}
          startedAt={room.question_started_at}
          final
        />
      );
      break;
    case 'final_reveal':
      content = (
        <RevealHost
          code={code}
          isHost={isHost}
          questionId={room.mainframe_question_id ?? ''}
          final
        />
      );
      break;
    case 'game_over':
      content = <GameOverHost code={code} isHost={isHost} />;
      break;
    default:
      content = (
        <div className="font-pixel text-xs text-zinc-500">UNKNOWN PHASE: {room.phase}</div>
      );
  }

  return (
    <main
      className="min-h-screen p-4 sm:p-6 flex items-start justify-center"
      style={{ backgroundColor: C.bg }}
    >
      <div className="w-full max-w-[1280px]">
        <HostFrame>{content}</HostFrame>
      </div>
    </main>
  );
}
