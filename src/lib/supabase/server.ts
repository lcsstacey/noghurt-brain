import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/lib/database.types';

/**
 * Server-side Supabase client. Use in server components, route handlers,
 * and server actions. Reads + writes auth cookies via Next's `cookies()`.
 *
 * IMPORTANT: in server components, `cookieStore.set()` will throw because
 * cookies are read-only there. The setAll wrapper swallows that error so
 * the same client works in both contexts. Cookie writes from server actions
 * and route handlers are the source of truth for session refresh.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // setAll called from a server component — middleware refreshes
            // sessions, so this is safe to ignore here.
          }
        },
      },
    },
  );
}
