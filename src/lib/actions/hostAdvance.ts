'use server';

import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth/getUser';

export type HostAdvanceResult = { ok: true } | { ok: false; error: string };

/**
 * Plain phase advance, host-only. Used for transitions that don't need
 * grading (intro→question, reveal→next intro, mainframe_intro→wager,
 * final_reveal→game_over).
 */
export async function hostAdvance(code: string): Promise<HostAdvanceResult> {
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

    const { error } = await supabase.rpc('advance_phase', { p_room_id: room.id });
    if (error) return { ok: false, error: error.message };

    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'unknown error' };
  }
}
