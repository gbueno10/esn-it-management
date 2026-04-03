import { createPublicClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isESNAdmin } from '@/lib/auth/permissions'

// GET /api/schemas/[name]/tables - List tables and columns for a schema
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params
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

  // Validate schema name to prevent SQL injection
  if (!/^[a-z_][a-z0-9_]*$/.test(name)) {
    return NextResponse.json({ error: 'Invalid schema name' }, { status: 400 })
  }

  const { data, error } = await supabase.rpc('get_schema_tables', {
    schema_param: name,
  })

  if (error) {
    return NextResponse.json(
      {
        error: 'Could not fetch schema tables. You may need to create the get_schema_tables database function.',
        details: error.message,
      },
      { status: 500 }
    )
  }

  // Group columns by table
  const tables: Record<string, { table_name: string; columns: Array<{ column_name: string; data_type: string; is_nullable: string; column_default: string | null }> }> = {}

  for (const row of data || []) {
    if (!tables[row.table_name]) {
      tables[row.table_name] = { table_name: row.table_name, columns: [] }
    }
    tables[row.table_name].columns.push({
      column_name: row.column_name,
      data_type: row.data_type,
      is_nullable: row.is_nullable,
      column_default: row.column_default,
    })
  }

  return NextResponse.json({ data: Object.values(tables) })
}
