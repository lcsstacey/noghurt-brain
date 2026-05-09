'use server';

import { createClient } from '@/lib/supabase/server';

/**
 * Sign the caller in as a guest (anonymous Supabase auth) if they don't
 * already have a session. Idempotent — safe to call from any server action
 * that needs an authed user.
 *
 * Throws if anonymous sign-in is disabled in the Supabase dashboard.
 */
export async function signInAnonIfNeeded() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) return user;

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) {
    throw new Error(`Anonymous sign-in failed: ${error.message}`);
  }
  if (!data.user) {
    throw new Error('Anonymous sign-in returned no user');
  }
  return data.user;
}
