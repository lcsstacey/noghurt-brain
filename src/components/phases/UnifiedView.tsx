'use client';

import { C } from '@/styles/palette';
import { HostFrame } from '@/components/chrome/HostFrame';
import { HostAdminBar } from '@/components/shared/HostAdminBar';
import { HostAdminProvider } from '@/lib/game/HostAdminContext';
import { useRoomChannel } from '@/lib/realtime/useRoomChannel';
import { useMusicPhase } from '@/lib/audio/MusicProvider';
import type { GamePhase } from '@/lib/audio/songs';

import { LobbyHost } from '@/components/phases/lobby/LobbyHost';
import { LobbyPhone } from '@/components/phases/lobby/LobbyPhone';
import { IntroHost } from '@/components/phases/intro/IntroHost';
import { IntroPhone } from '@/components/phases/intro/IntroPhone';
import { QuestionHost } from '@/components/phases/question/QuestionHost';
import { QuestionPhone } from '@/components/phases/question/QuestionPhone';
import { RevealHost } from '@/components/phases/reveal/RevealHost';
import { ResultPhone } from '@/components/phases/reveal/ResultPhone';
import { MainframeIntroHost } from '@/components/phases/mainframe/MainframeIntroHost';
import { MainframeIntroPhone } from '@/components/phases/mainframe/MainframeIntroPhone';
import { WagerHost } from '@/components/phases/wager/WagerHost';
import { WagerPhone } from '@/components/phases/wager/WagerPhone';
import { GameOverHost } from '@/components/phases/game_over/GameOverHost';
import { GameOverPhone } from '@/components/phases/game_over/GameOverPhone';

import type { Database } from '@/lib/database.types';

type RoomRow = Database['public']['Tables']['rooms']['Row'];
type PlayerRow = Database['public']['Tables']['players']['Row'];

type Props = {
  code: string;
  playerId: string;
  joinUrl: string;
};

/**
 * Single client component mounted at /play/[code]. Handles BOTH the host
 * and player views via adaptive rendering: phone-style on mobile, TV-style
 * on desktop. Host privileges live in a floating <HostAdminBar />.
 *
 * Replaces the previous HostPhaseRouter + PhonePhaseRouter split.
 */
export function UnifiedView({ code, playerId, joinUrl }: Props) {
  const { room, players } = useRoomChannel(code);
  const me = players.find((p) => p.id === playerId);

  // Music follows phase. Provider handles autostart + crossfade.
  useMusicPhase((room?.phase as GamePhase | undefined) ?? null);

  if (!room || !me) {
    return (
      <div
        className="min-h-screen grid place-items-center"
        style={{ backgroundColor: C.bg }}
      >
        <div className="font-pixel text-xs text-zinc-500">CONNECTING…</div>
      </div>
    );
  }

  // Player was kicked (or left and re-rendered from stale state).
  // Server page will re-evaluate on next refresh; for now show a friendly
  // notice. The polling fallback in useRoomChannel will pick up the
  // deletion and players.find above will return undefined — handled below.
  // (We could router.refresh() here but the deletion already triggered a
  // re-render; the player is just gone from `players`.)

  const isHost = me.is_host;

  return (
    <HostAdminProvider>
      {isHost && <HostAdminBar code={code} room={room} players={players} />}

      {/* Mobile: phone-style. */}
      <div className="md:hidden">
        <PhoneViewForPhase room={room} me={me} code={code} />
      </div>

      {/* Desktop: TV-style fills viewport vertically. */}
      <div className="hidden md:block">
        <TvViewForPhase room={room} me={me} code={code} joinUrl={joinUrl} isHost={isHost} />
      </div>
    </HostAdminProvider>
  );
}

function PhoneViewForPhase({ room, me, code }: { room: RoomRow; me: PlayerRow; code: string }) {
  const totalRounds = (room.questions as string[]).length + 1;
  const currentNormalId = (room.questions as string[])[room.current_question_idx];

  switch (room.phase) {
    case 'lobby':
      return <LobbyPhone code={code} playerId={me.id} />;
    case 'intro':
      return <IntroPhone me={me} roundIndex={room.current_question_idx} totalRounds={totalRounds} />;
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

function TvViewForPhase({
  room,
  me,
  code,
  joinUrl,
  isHost,
}: {
  room: RoomRow;
  me: PlayerRow;
  code: string;
  joinUrl: string;
  isHost: boolean;
}) {
  const totalRounds = (room.questions as string[]).length + 1;
  const currentNormalId = (room.questions as string[])[room.current_question_idx];

  let content;
  switch (room.phase) {
    case 'lobby':
      content = (
        <LobbyHost
          code={code}
          joinUrl={joinUrl}
          showStartButton={!isHost}
          meId={me.id}
          isHost={isHost}
        />
      );
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
          hostPlayerId={me.id}
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
          hostPlayerId={me.id}
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
          hostPlayerId={me.id}
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
      className="min-h-screen p-4 sm:p-6 flex justify-center"
      style={{ backgroundColor: C.bg }}
    >
      <div className="w-full max-w-[1280px] flex flex-col">
        <HostFrame className="flex-1">{content}</HostFrame>
      </div>
    </main>
  );
}
