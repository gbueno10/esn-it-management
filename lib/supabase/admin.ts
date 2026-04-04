import { createClient } from '@supabase/supabase-js'

/**
 * Create a Supabase admin client using the service role key.
 * Use this ONLY on the server for admin operations like listing auth users.
 * Never expose the service role key to the client.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!key) {
    console.error('[admin] SUPABASE_SERVICE_ROLE_KEY is not set!')
  }

  return createClient(url, key, {
    db: { schema: 'public' },
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

/**
 * Create an admin client for the project schema (it_manager).
 * Use for service_role operations on project-specific tables.
 */
export function createProjectAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const schema = process.env.NEXT_PUBLIC_SUPABASE_SCHEMA || 'public'

  return createClient(url, key, {
    db: { schema },
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

/**
 * Get a map of user_id -> email from auth.users
 */
export async function getAuthEmailMap(): Promise<Record<string, string>> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return {}

  const admin = createAdminClient()
  const emailMap: Record<string, string> = {}

  let page = 1
  let hasMore = true

  while (hasMore) {
    const { data } = await admin.auth.admin.listUsers({ page, perPage: 1000 })
    if (data?.users) {
      for (const u of data.users) {
        if (u.email) emailMap[u.id] = u.email
      }
      hasMore = data.users.length === 1000
      page++
    } else {
      hasMore = false
    }
  }

  return emailMap
}
