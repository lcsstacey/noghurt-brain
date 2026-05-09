'use server';

import { createClient } from '@/lib/supabase/server';
import { signInAnonIfNeeded } from '@/lib/auth/signInAnon';
import type { PlayerColor } from '@/lib/types';

const VALID_COLORS: PlayerColor[] = ['pink', 'cyan', 'green', 'yellow', 'red', 'purple'];

export type JoinRoomInput = {
  code: string;
  name: string;
  color: PlayerColor;
  /** Pass true when the caller is the room's host claiming their own seat. */
  asHost?: boolean;
};

export type JoinRoomResult =
  | { ok: true; playerId: string }
  | { ok: false; error: string };

/**
 * Join a room as a player. Signs the caller in anonymously if needed,
 * validates the room is still in the lobby, and inserts a player row.
 *
 * Returns the new player's id on success. Surfaces sensible errors for the
 * common failure modes (room not found, already in progress, color taken,
 * room full, name too long).
 */
export async function joinRoom(input: JoinRoomInput): Promise<JoinRoomResult> {
  try {
    const name = input.name.trim();
    if (name.length < 1 || name.length > 12) {
      return { ok: false, error: 'name must be 1–12 characters' };
    }
    if (!VALID_COLORS.includes(input.color)) {
      return { ok: false, error: 'invalid color' };
    }

    const user = await signInAnonIfNeeded();
    const supabase = await createClient();

    const { data: room } = await supabase
      .from('rooms')
      .select('id, phase, host_id')
      .eq('code', input.code.toUpperCase())
      .single();

    if (!room) return { ok: false, error: 'room not found' };
    if (room.phase !== 'lobby') return { ok: false, error: 'game already in progress' };

    // The host inserts their own player row with is_host=true; non-hosts must
    // not claim host status (the asHost flag is server-trusted only for the
    // matching auth.uid()).
    const isHost = !!input.asHost && room.host_id === user.id;

    const { count } = await supabase
      .from('players')
      .select('id', { count: 'exact', head: true })
      .eq('room_id', room.id);

    if ((count ?? 0) >= 8) return { ok: false, error: 'room is full' };

    const { data: player, error } = await supabase
      .from('players')
      .insert({
        room_id: room.id,
        user_id: user.id,
        name,
        color: input.color,
        is_host: isHost,
      })
      .select('id')
      .single();

    if (error) {
      if (error.code === '23505') {
        // Either this user already has a row in this room or the color is taken.
        return { ok: false, error: 'color already taken (or you are already in this room)' };
      }
      return { ok: false, error: error.message };
    }

    return { ok: true, playerId: player.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'unknown error' };
  }
}
