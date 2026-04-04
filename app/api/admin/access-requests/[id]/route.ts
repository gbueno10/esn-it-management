import { createPublicClient } from '@/lib/supabase/server'
import { isESNAdmin } from '@/lib/auth/permissions'
import { NextResponse } from 'next/server'

// PATCH /api/admin/access-requests/[id] — Approve or reject
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createPublicClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const isAdmin = await isESNAdmin()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
  }

  const body = await request.json()
  const { status } = body

  if (!status || !['approved', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'status must be "approved" or "rejected"' }, { status: 400 })
  }

  // Get the request
  const { data: accessReq, error: fetchErr } = await supabase
    .from('access_requests')
    .select('*')
    .eq('id', id)
    .eq('status', 'pending')
    .single()

  if (fetchErr || !accessReq) {
    return NextResponse.json({ error: 'Request not found or already reviewed' }, { status: 404 })
  }

  // Update request status
  const { error: updateErr } = await supabase
    .from('access_requests')
    .update({
      status,
      reviewed_by: user.email,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 })
  }

  // If approved, grant or upgrade access
  if (status === 'approved') {
    const requestedRole = accessReq.requested_role || 'user'

    // Check if user already has access (admin upgrade case)
    const { data: existing } = await supabase
      .from('user_project_access')
      .select('id, role')
      .eq('user_id', accessReq.user_id)
      .eq('project_slug', accessReq.project_slug)
      .is('revoked_at', null)
      .maybeSingle()

    if (existing && requestedRole === 'admin') {
      // Upgrade existing access to admin
      const { error: upgradeErr } = await supabase
        .from('user_project_access')
        .update({ role: 'admin' })
        .eq('id', existing.id)

      if (upgradeErr) {
        console.error('[PATCH /api/admin/access-requests] upgrade error', upgradeErr)
        return NextResponse.json({ error: upgradeErr.message }, { status: 500 })
      }
    } else if (!existing) {
      // Grant new access
      const { error: grantErr } = await supabase
        .from('user_project_access')
        .insert({
          user_id: accessReq.user_id,
          project_slug: accessReq.project_slug,
          role: requestedRole,
          granted_by: user.id,
        })

      if (grantErr) {
        console.error('[PATCH /api/admin/access-requests] grant error', grantErr)
        return NextResponse.json({ error: grantErr.message }, { status: 500 })
      }
    }
  }

  return NextResponse.json({ success: true, status })
}
