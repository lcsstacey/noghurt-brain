import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * OAuth callback. Supabase redirects here after Discord auth with a code
 * we exchange for a session. The `next` query param tells us where to go
 * afterward (preserves /host/[code] or /play/[code] context).
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${url.origin}${next}`);
    }
  }

  // Fall back to landing on failure.
  return NextResponse.redirect(`${url.origin}/?auth=failed`);
}
