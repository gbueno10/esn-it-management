import { createPublicClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isESNAdmin } from '@/lib/auth/permissions'

// PATCH /api/users/[id]/access/[accessId] - Update project role
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; accessId: string }> }
) {
  const { accessId } = await params
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

  if (!body.role || !['user', 'admin'].includes(body.role)) {
    return NextResponse.json(
      { error: 'Valid role required: user or admin' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('user_project_access')
    .update({ role: body.role })
    .eq('id', accessId)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

// DELETE /api/users/[id]/access/[accessId] - Revoke project access
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; accessId: string }> }
) {
  const { accessId } = await params
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

  const { data, error } = await supabase
    .from('user_project_access')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', accessId)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}
