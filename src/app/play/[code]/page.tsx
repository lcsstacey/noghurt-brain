import { notFound } from 'next/navigation';
import { C } from '@/styles/palette';
import { createClient } from '@/lib/supabase/server';
import { JoinForm } from '@/components/phases/lobby/JoinForm';
import { PhonePhaseRouter } from '@/components/phases/PhonePhaseRouter';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ code: string }>;
};

function CantJoin() {
  return (
    <main
      className="min-h-screen flex items-center justify-center p-6"
      style={{ backgroundColor: C.bg }}
    >
      <div className="font-pixel text-center" style={{ color: C.red }}>
        <div className="text-2xl text-glow">GAME IN PROGRESS</div>
        <div className="font-crt text-base text-zinc-500 mt-3">
          This room can&apos;t be joined right now.
        </div>
      </div>
    </main>
  );
}

export default async function PlayPage({ params }: PageProps) {
  const { code: rawCode } = await params;
  const code = rawCode.toUpperCase();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // RPC bypasses RLS so any visitor can resolve the room (404 vs join flow).
  const { data: rooms } = await supabase.rpc('find_room_by_code', { p_code: code });
  const room = rooms?.[0];

  if (!room) notFound();

  // Authed callers might already be a player in this room — even mid-game.
  // Check membership FIRST so existing players see their phone view (not
  // the "can't join" message intended for fresh visitors).
  const existing = user
    ? (
        await supabase
          .from('players')
          .select('id')
          .eq('room_id', room.id)
          .eq('user_id', user.id)
          .maybeSingle()
      ).data
    : null;

  if (existing) {
    return <PhonePhaseRouter code={code} playerId={existing.id} />;
  }

  // Not yet a player. They can only join while phase=lobby.
  if (room.phase !== 'lobby') return <CantJoin />;

  return <JoinForm code={code} role="player" />;
}
