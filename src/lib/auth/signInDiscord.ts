'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

/**
 * Begin the Discord OAuth flow. The user is redirected to Discord, then
 * back to /auth/callback?code=..., which exchanges the code for a session
 * and redirects to `next` (preserving room context).
 */
export async function signInWithDiscord(formData: FormData) {
  const next = String(formData.get('next') || '/');
  const supabase = await createClient();

  const headerList = await headers();
  const origin =
    headerList.get('origin') ??
    `https://${headerList.get('host') ?? 'noghurt-brain.vercel.app'}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'discord',
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    throw new Error(`Discord sign-in failed: ${error.message}`);
  }
  if (!data.url) {
    throw new Error('Discord sign-in returned no redirect URL');
  }

  redirect(data.url);
}
