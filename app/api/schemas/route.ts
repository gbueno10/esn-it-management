import { createPublicClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isESNAdmin } from '@/lib/auth/permissions'

const EXCLUDED_SCHEMAS = [
  'pg_catalog',
  'information_schema',
  'auth',
  'storage',
  'extensions',
  'graphql',
  'graphql_public',
  'pgbouncer',
  'pgsodium',
  'pgsodium_masks',
  'realtime',
  'supabase_functions',
  'supabase_migrations',
  'vault',
  'pg_toast',
  'pg_temp_1',
  'pg_toast_temp_1',
  '_realtime',
  '_analytics',
  'net',
  'cron',
]

// GET /api/schemas - List all database schemas with table counts
export async function GET() {
  const supabase = await createPublicClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const isAdmin = await isESNAdmin()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
  }

  // Query information_schema to get schemas and their table counts
  const { data, error } = await supabase.rpc('get_schemas_with_tables')

  if (error) {
    // Fallback: try a direct query if the RPC function doesn't exist
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('projects')
      .select('slug, name')

    if (fallbackError) {
      return NextResponse.json({ error: 'Could not fetch schemas. You may need to create the get_schemas_with_tables database function.' }, { status: 500 })
    }

    // Return project slugs as schema names
    const schemas = [
      { schema_name: 'public', table_count: 0 },
      ...(fallbackData || []).map((p) => ({
        schema_name: p.slug,
        table_count: 0,
      })),
    ]

    return NextResponse.json({ data: schemas, note: 'Table counts unavailable - create the get_schemas_with_tables database function for full schema info' })
  }

  // Filter out system schemas
  const filtered = (data || []).filter(
    (s: { schema_name: string }) => !EXCLUDED_SCHEMAS.includes(s.schema_name)
  )

  return NextResponse.json({ data: filtered })
}
