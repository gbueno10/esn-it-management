import { createClient } from '@/lib/supabase/server'
import { createProjectAdminClient } from '@/lib/supabase/admin'
import { isProjectAdmin } from '@/lib/auth/permissions'
import { NextResponse } from 'next/server'

// GET /api/tools — list all tools
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('tools')
    .select('*')
    .order('name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

// POST /api/tools — create tool (admin only)
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const isAdmin = await isProjectAdmin()
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  if (!body.name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

  const admin = createProjectAdminClient()
  const { data, error } = await admin
    .from('tools')
    .insert({
      name: body.name,
      description: body.description || null,
      url: body.url || null,
      icon_url: body.icon_url || null,
      notes: body.notes || null,
      requires_login: body.requires_login ?? false,
      login_username: body.login_username || null,
      login_password: body.login_password || null,
      status: body.status || 'active',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
