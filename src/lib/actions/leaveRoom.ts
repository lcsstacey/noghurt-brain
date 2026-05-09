'use server';

import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth/getUser';

export type LeaveRoomResult = { ok: true } | { ok: false; error: string };

/**
 * Remove the caller's player row from the room. If the host leaves while
 * the room is still in lobby, the entire room is deleted (cleanup).
 *
 * Once the game has started, the host can't cleanly leave — Phase 4 polish
 * will handle host-drop / reconnect logic.
 */
export async function leaveRoom(code: string): Promise<LeaveRoomResult> {
  try {
    const user = await getUser();
    if (!user) return { ok: false, error: 'not signed in' };

    const supabase = await createClient();

    const { data: room } = await supabase
      .from('rooms')
      .select('id, phase, host_id')
      .eq('code', code.toUpperCase())
      .single();

    if (!room) return { ok: false, error: 'room not found' };

    if (room.host_id === user.id && room.phase === 'lobby') {
      // Host leaves an unstarted room → delete the room (cascades players).
      const { error } = await supabase.from('rooms').delete().eq('id', room.id);
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    }

    const { error } = await supabase
      .from('players')
      .delete()
      .eq('room_id', room.id)
      .eq('user_id', user.id);

    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'unknown error' };
  }
}
