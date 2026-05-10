import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { C } from '@/styles/palette';
import { createClient } from '@/lib/supabase/server';
import { JoinForm } from '@/components/phases/lobby/JoinForm';
import { UnifiedView } from '@/components/phases/UnifiedView';

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

  // Authed user might already have a player row in this room.
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
    const headerList = await headers();
    const origin =
      headerList.get('origin') ??
      `https://${headerList.get('host') ?? 'noghurt-brain.vercel.app'}`;
    const joinUrl = `${origin}/play/${code}`;
    return <UnifiedView code={code} playerId={existing.id} joinUrl={joinUrl} />;
  }

  // No player row yet. Lobby joinable; mid-game = blocked for newcomers.
  if (room.phase !== 'lobby') return <CantJoin />;

  // Render JoinForm. The role determines the is_host flag on insert; users
  // whose user.id matches room.host_id are creating their host seat.
  const role = user && user.id === room.host_id ? 'host' : 'player';

  // If they came in via Discord OAuth, lift the username + avatar off the
  // user metadata so JoinForm can pre-fill the callsign + show a
  // "signed in as X" affordance. Anon users have no metadata to surface.
  const isDiscord = user?.app_metadata?.provider === 'discord';
  const meta = (user?.user_metadata ?? {}) as Record<string, unknown>;
  const discordUser = isDiscord
    ? {
        name:
          (meta.global_name as string | undefined) ||
          (meta.full_name as string | undefined) ||
          (meta.name as string | undefined) ||
          (meta.user_name as string | undefined) ||
          (meta.preferred_username as string | undefined) ||
          'PLAYER',
        avatarUrl: (meta.avatar_url as string | undefined) ?? null,
      }
    : null;

  return <JoinForm code={code} role={role} discordUser={discordUser} />;
}
