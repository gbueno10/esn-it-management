import { createBrowserClient } from '@supabase/ssr'

const SCHEMA = process.env.NEXT_PUBLIC_SUPABASE_SCHEMA || 'public'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: { schema: SCHEMA },
    }
  )
}

/**
 * Create a client that accesses the public schema
 * Use this when you need to access shared tables like profiles, projects, etc.
 */
export function createPublicClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: { schema: 'public' },
    }
  )
}
