'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

/**
 * Begin the Discord OAuth flow.
 *
 * If the user is already signed in (anonymously, from a CREATE ROOM
 * gesture for example), we use Supabase's `linkIdentity` to ATTACH
 * Discord as a second identity on their existing account — preserving
 * `user.id`, which is what `room.host_id` references. Using
 * `signInWithOAuth` here would mint a fresh user, breaking the host
 * status link and any other rows that point to the original auth.uid.
 *
 * If the user has no session yet, we use `signInWithOAuth` (creates a
 * brand-new Discord-backed user).
 */
export async function signInWithDiscord(formData: FormData) {
  const next = String(formData.get('next') || '/');
  const supabase = await createClient();

  const headerList = await headers();
  const origin =
    headerList.get('origin') ??
    `https://${headerList.get('host') ?? 'noghurt-brain.vercel.app'}`;
  const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(next)}`;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let url: string | null = null;

  if (user) {
    // Anon (or already-Discord) user — link Discord to the existing account.
    // This is the case for hosts who created a room (which signed them in
    // anon) and now want to associate Discord. user.id stays stable so
    // room.host_id still matches.
    const { data, error } = await supabase.auth.linkIdentity({
      provider: 'discord',
      options: { redirectTo },
    });
    if (!error) {
      url = data?.url ?? null;
    } else {
      // Fall through to fresh OAuth on link failure (e.g. provider already
      // linked to a different user). signInWithOAuth will mint a new user
      // — host status will break, but at least sign-in succeeds rather than
      // dead-ending with an error.
      // eslint-disable-next-line no-console
      console.warn('[signInWithDiscord] linkIdentity failed, falling back:', error.message);
    }
  }

  if (!url) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: { redirectTo },
    });
    if (error) throw new Error(`Discord sign-in failed: ${error.message}`);
    url = data?.url ?? null;
  }

  if (!url) throw new Error('Discord sign-in returned no redirect URL');
  redirect(url);
}
