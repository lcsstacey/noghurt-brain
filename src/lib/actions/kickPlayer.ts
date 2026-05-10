'use server';

import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth/getUser';

export type KickPlayerResult = { ok: true } | { ok: false; error: string };

/**
 * Host kicks a player from the lobby. Server-enforces:
 *   - caller is the room host
 *   - room is in lobby phase
 *   - host can't kick themselves
 *
 * Realtime + the polling fallback in useRoomChannel propagate the
 * deletion to the kicked player's UnifiedView, which detects "I'm not
 * in players anymore" and bounces them back to the JoinForm.
 */
export async function kickPlayer(code: string, playerId: string): Promise<KickPlayerResult> {
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

    const { error } = await supabase.rpc('kick_player', {
      p_room_id: room.id,
      p_player_id: playerId,
    });
    if (error) return { ok: false, error: error.message };

    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'unknown error' };
  }
}
