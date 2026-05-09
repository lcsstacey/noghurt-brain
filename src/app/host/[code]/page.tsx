import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { HostFrame } from '@/components/chrome/HostFrame';
import { LobbyHost } from '@/components/phases/lobby/LobbyHost';
import { JoinForm } from '@/components/phases/lobby/JoinForm';

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

  const { data: room } = await supabase
    .from('rooms')
    .select('id, host_id, phase')
    .eq('code', code)
    .single();

  if (!room) notFound();

  // Not the host of this room → bounce to play view.
  if (user && user.id !== room.host_id) {
    redirect(`/play/${code}`);
  }

  // No session at all → render JoinForm. JoinForm will sign in anonymously
  // (or via Discord) on submit; we treat unauthed visitors as the prospective
  // host claiming their own seat.
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

  // Phase 3 will switch on room.phase to render the right host view here.
  // Phase 2 only handles the lobby.
  if (room.phase !== 'lobby') {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-[#05050a]">
        <div className="font-pixel text-cyan-400 text-glow text-2xl text-center">
          ▸ ROUND IN PROGRESS
          <div className="font-crt text-base text-zinc-500 mt-2">
            (Phase 3 wires up the question screens.)
          </div>
        </div>
      </main>
    );
  }

  const headerList = await headers();
  const origin =
    headerList.get('origin') ?? `https://${headerList.get('host') ?? 'noghurt-brain.vercel.app'}`;
  const joinUrl = `${origin}/play/${code}`;

  return (
    <main
      className="min-h-screen p-4 sm:p-6 flex items-start justify-center"
      style={{ backgroundColor: '#05050a' }}
    >
      <div className="w-full max-w-[1280px]">
        <HostFrame>
          <LobbyHost code={code} joinUrl={joinUrl} />
        </HostFrame>
      </div>
    </main>
  );
}
