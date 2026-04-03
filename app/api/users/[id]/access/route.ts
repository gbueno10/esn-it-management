import { createPublicClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isESNAdmin } from '@/lib/auth/permissions'

// GET /api/users/[id]/access - List project access for a user
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createPublicClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('user_project_access')
    .select('*, projects:project_slug(name, access_level, is_active)')
    .eq('user_id', id)
    .is('revoked_at', null)
    .order('granted_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

// POST /api/users/[id]/access - Grant project access to a user
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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

  const body = await request.json()

  if (!body.project_slug) {
    return NextResponse.json({ error: 'project_slug is required' }, { status: 400 })
  }

  // Check if access already exists
  const { data: existing } = await supabase
    .from('user_project_access')
    .select('id')
    .eq('user_id', id)
    .eq('project_slug', body.project_slug)
    .is('revoked_at', null)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'User already has access to this project' }, { status: 409 })
  }

  const { data, error } = await supabase
    .from('user_project_access')
    .insert({
      user_id: id,
      project_slug: body.project_slug,
      role: body.role || 'user',
      granted_by: user.email,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
