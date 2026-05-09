'use server';

import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth/getUser';

export type StartGameResult = { ok: true } | { ok: false; error: string };

/**
 * Advance the room from lobby → intro by calling the advance_phase RPC.
 * The RPC enforces host-only via auth.uid() comparison; we still do an
 * upfront check so we can return a clean error.
 */
export async function startGame(code: string): Promise<StartGameResult> {
  try {
    const user = await getUser();
    if (!user) return { ok: false, error: 'not signed in' };

    const supabase = await createClient();

    const { data: room } = await supabase
      .from('rooms')
      .select('id, host_id, phase')
      .eq('code', code.toUpperCase())
      .single();

    if (!room) return { ok: false, error: 'room not found' };
    if (room.host_id !== user.id) return { ok: false, error: 'only the host can start the game' };
    if (room.phase !== 'lobby') return { ok: false, error: 'game already started' };

    const { count } = await supabase
      .from('players')
      .select('id', { count: 'exact', head: true })
      .eq('room_id', room.id);

    if ((count ?? 0) < 2) {
      return { ok: false, error: 'need at least 2 players to start' };
    }

    const { error } = await supabase.rpc('advance_phase', { p_room_id: room.id });
    if (error) return { ok: false, error: error.message };

    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'unknown error' };
  }
}
