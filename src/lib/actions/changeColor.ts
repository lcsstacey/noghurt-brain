'use server';

import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth/getUser';
import type { PlayerColor } from '@/lib/types';

const VALID_COLORS: PlayerColor[] = ['pink', 'cyan', 'green', 'yellow', 'red', 'purple'];

export type ChangeColorResult = { ok: true } | { ok: false; error: string };

/**
 * Update the caller's color in the given room. Lobby phase only.
 * The (room_id, color) UNIQUE constraint blocks collisions at the DB layer.
 */
export async function changeColor(code: string, color: PlayerColor): Promise<ChangeColorResult> {
  try {
    if (!VALID_COLORS.includes(color)) {
      return { ok: false, error: 'invalid color' };
    }

    const user = await getUser();
    if (!user) return { ok: false, error: 'not signed in' };

    const supabase = await createClient();

    const { data: room } = await supabase
      .from('rooms')
      .select('id, phase')
      .eq('code', code.toUpperCase())
      .single();

    if (!room) return { ok: false, error: 'room not found' };
    if (room.phase !== 'lobby') return { ok: false, error: 'cannot change color after game starts' };

    const { error } = await supabase
      .from('players')
      .update({ color })
      .eq('room_id', room.id)
      .eq('user_id', user.id);

    if (error) {
      if (error.code === '23505') return { ok: false, error: 'color already taken' };
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'unknown error' };
  }
}
