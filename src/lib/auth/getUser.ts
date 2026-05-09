import { createClient } from '@/lib/supabase/server';

/**
 * Server-side user lookup. Returns the authenticated Supabase user, or null.
 * Use in server components, server actions, and route handlers.
 */
export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
