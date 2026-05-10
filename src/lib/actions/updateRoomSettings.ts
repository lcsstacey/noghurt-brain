'use server';

import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth/getUser';
import { DEFAULT_ROOM_SETTINGS, type RoomSettings } from '@/lib/types';
import type { Category } from '@/data/questions';

const VALID_CATEGORIES: Category[] = ['science', 'internet', 'geography', 'retro'];
const MIN_ROUNDS = 3;
const MAX_ROUNDS = 7;

export type UpdateSettingsResult = { ok: true } | { ok: false; error: string };

/**
 * Host updates room settings (categories, difficulty, rounds_count).
 * Lobby-only; server validates each field. Partial updates merge with
 * the existing settings row.
 */
export async function updateRoomSettings(
  code: string,
  partial: Partial<RoomSettings>,
): Promise<UpdateSettingsResult> {
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
    if (room.phase !== 'lobby') {
      return { ok: false, error: 'settings locked once game starts' };
    }

    const current = (room.settings as RoomSettings | null) ?? DEFAULT_ROOM_SETTINGS;
    const next: RoomSettings = { ...current, ...partial };

    // Validate.
    if (partial.categories !== undefined) {
      const cats = partial.categories.filter((c) => VALID_CATEGORIES.includes(c));
      if (cats.length < 1) return { ok: false, error: 'pick at least 1 category' };
      next.categories = cats;
    }
    if (partial.difficulty !== undefined) {
      if (partial.difficulty !== 'normal' && partial.difficulty !== 'nightmare') {
        return { ok: false, error: 'invalid difficulty' };
      }
    }
    if (partial.rounds_count !== undefined) {
      const n = Math.floor(partial.rounds_count);
      if (n < MIN_ROUNDS || n > MAX_ROUNDS) {
        return { ok: false, error: `rounds must be ${MIN_ROUNDS}-${MAX_ROUNDS}` };
      }
      next.rounds_count = n;
    }

    const { error } = await supabase
      .from('rooms')
      .update({ settings: next })
      .eq('id', room.id);

    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'unknown error' };
  }
}
