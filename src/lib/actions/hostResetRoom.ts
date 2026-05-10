'use server';

import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth/getUser';

export type HostResetResult = { ok: true } | { ok: false; error: string };

/**
 * Host clicks RUN IT BACK after game-over. Wipes scores, answers, wagers,
 * and returns the room to lobby phase with the same players.
 */
export async function hostResetRoom(code: string): Promise<HostResetResult> {
  try {
    const user = await getUser();
    if (!user) return { ok: false, error: 'not signed in' };

    const supabase = await createClient();

    const { data: rooms } = await supabase.rpc('find_room_by_code', {
      p_code: code.toUpperCase(),
    });
    const room = rooms?.[0];
    if (!room) return { ok: false, error: 'room not found' };
    if (room.host_id !== user.id) return { ok: false, error: 'host only' };

    const { error } = await supabase.rpc('reset_room', { p_room_id: room.id });
    if (error) return { ok: false, error: error.message };

    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'unknown error' };
  }
}
