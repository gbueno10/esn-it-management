import { createPublicClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST /api/volunteer/access-request — Submit an access request (user or admin role)
export async function POST(request: Request) {
  const supabase = await createPublicClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { project_slug, message, requested_role } = body
  const role = requested_role === 'admin' ? 'admin' : 'user'

  if (!project_slug) {
    return NextResponse.json({ error: 'project_slug is required' }, { status: 400 })
  }

  // Check project exists and is active
  const { data: project } = await supabase
    .from('projects')
    .select('slug, is_active')
    .eq('slug', project_slug)
    .single()

  if (!project || !project.is_active) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  // Check current access level
  const { data: existing } = await supabase
    .from('user_project_access')
    .select('id, role')
    .eq('user_id', user.id)
    .eq('project_slug', project_slug)
    .is('revoked_at', null)
    .maybeSingle()

  // If requesting user role but already has access, reject
  if (existing && role === 'user') {
    return NextResponse.json({ error: 'You already have access to this project' }, { status: 409 })
  }

  // If requesting admin but already admin, reject
  if (existing?.role === 'admin' && role === 'admin') {
    return NextResponse.json({ error: 'You are already an admin of this project' }, { status: 409 })
  }

  // Check no pending request exists for this role
  const { data: pendingReq } = await supabase
    .from('access_requests')
    .select('id')
    .eq('user_id', user.id)
    .eq('project_slug', project_slug)
    .eq('status', 'pending')
    .maybeSingle()

  if (pendingReq) {
    return NextResponse.json({ error: 'You already have a pending request for this project' }, { status: 409 })
  }

  // Create request
  const { data, error } = await supabase
    .from('access_requests')
    .insert({
      user_id: user.id,
      project_slug,
      requested_role: role,
      message: message || null,
    })
    .select()
    .single()

  if (error) {
    console.error('[POST /api/volunteer/access-request]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
