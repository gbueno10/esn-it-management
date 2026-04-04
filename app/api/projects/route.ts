import { createPublicClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isESNAdmin } from '@/lib/auth/permissions'

// GET /api/projects - List all projects
export async function GET() {
  const supabase = await createPublicClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

// POST /api/projects - Create a new project
export async function POST(request: Request) {
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

  if (!body.slug || !body.name) {
    return NextResponse.json({ error: 'Slug and name are required' }, { status: 400 })
  }

  // Validate slug format
  if (!/^[a-z][a-z0-9_]*$/.test(body.slug)) {
    return NextResponse.json(
      { error: 'Slug must start with a letter and contain only lowercase letters, numbers, and underscores' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('projects')
    .insert({
      slug: body.slug,
      name: body.name,
      description: body.description || null,
      image_url: body.image_url || null,
      app_url: body.app_url || null,
      access_level: body.access_level || 'staff_only',
      allow_signup: body.allow_signup ?? false,
      allow_access_requests: body.allow_access_requests ?? false,
      allow_admin_requests: body.allow_admin_requests ?? false,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'A project with this slug already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
