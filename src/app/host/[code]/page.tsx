import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { JoinForm } from '@/components/phases/lobby/JoinForm';
import { HostPhaseRouter } from '@/components/phases/HostPhaseRouter';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ code: string }>;
};

export default async function HostPage({ params }: PageProps) {
  const { code: rawCode } = await params;
  const code = rawCode.toUpperCase();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // RPC bypasses RLS so non-members can resolve the room (404 vs join flow).
  const { data: rooms } = await supabase.rpc('find_room_by_code', { p_code: code });
  const room = rooms?.[0];

  if (!room) notFound();

  // Not the host of this room → bounce to play view.
  if (user && user.id !== room.host_id) {
    redirect(`/play/${code}`);
  }

  if (!user) {
    return <JoinForm code={code} role="host" />;
  }

  // Authed host — does the host have a player row yet?
  const { data: existing } = await supabase
    .from('players')
    .select('id')
    .eq('room_id', room.id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!existing) {
    return <JoinForm code={code} role="host" />;
  }

  const headerList = await headers();
  const origin =
    headerList.get('origin') ?? `https://${headerList.get('host') ?? 'noghurt-brain.vercel.app'}`;
  const joinUrl = `${origin}/play/${code}`;

  return <HostPhaseRouter code={code} isHost joinUrl={joinUrl} />;
}
