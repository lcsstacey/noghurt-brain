import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/lib/database.types';

/**
 * Browser-side Supabase client. Use in `"use client"` components.
 *
 * Reads the public env vars (`NEXT_PUBLIC_*`) which are inlined at build time.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
