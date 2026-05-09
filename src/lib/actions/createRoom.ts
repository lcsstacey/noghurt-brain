'use server';

import { createClient } from '@/lib/supabase/server';
import { signInAnonIfNeeded } from '@/lib/auth/signInAnon';
import { generateRoomCode } from '@/lib/game/code';

const MAX_COLLISION_RETRIES = 5;

export type CreateRoomResult =
  | { ok: true; code: string }
  | { ok: false; error: string };

/**
 * Create a new room. Signs the caller in anonymously if they don't already
 * have a session. Retries on the very rare 4-char code collision.
 *
 * The caller becomes the host; their player row is created later when they
 * land on /host/[code] and fill out the JoinForm.
 */
export async function createRoom(): Promise<CreateRoomResult> {
  try {
    const user = await signInAnonIfNeeded();
    const supabase = await createClient();

    for (let attempt = 0; attempt < MAX_COLLISION_RETRIES; attempt++) {
      const code = generateRoomCode();
      const { data, error } = await supabase
        .from('rooms')
        .insert({ code, host_id: user.id, phase: 'lobby' })
        .select('code')
        .single();

      if (data) return { ok: true, code: data.code };

      // 23505 = unique_violation. Retry on collision; surface anything else.
      if (error?.code !== '23505') {
        return { ok: false, error: error?.message ?? 'createRoom failed' };
      }
    }

    return { ok: false, error: 'too many code collisions, try again' };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'unknown error' };
  }
}
