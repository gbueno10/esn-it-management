import { createClient } from '@/lib/supabase/server'
import { createProjectAdminClient } from '@/lib/supabase/admin'
import { isProjectAdmin } from '@/lib/auth/permissions'
import { NextResponse } from 'next/server'

// PATCH /api/tools/[id] — update tool (admin only)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const isAdmin = await isProjectAdmin()
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  const allowed = ['name', 'description', 'url', 'icon_url', 'notes', 'requires_login', 'login_username', 'login_password', 'status']
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key]
  }

  const admin = createProjectAdminClient()
  const { data, error } = await admin
    .from('tools')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

// DELETE /api/tools/[id] — delete tool (admin only)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const isAdmin = await isProjectAdmin()
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const admin = createProjectAdminClient()
  const { error } = await admin
    .from('tools')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
