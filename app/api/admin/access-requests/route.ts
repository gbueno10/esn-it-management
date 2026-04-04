import { createPublicClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isESNAdmin } from '@/lib/auth/permissions'
import { NextResponse } from 'next/server'

// GET /api/admin/access-requests — List pending access requests
export async function GET() {
  const supabase = await createPublicClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const isAdmin = await isESNAdmin()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
  }

  const admin = createAdminClient()

  // Get pending requests
  const { data: requests, error } = await admin
    .from('access_requests')
    .select('*, projects:project_slug(name)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Enrich with user info from auth + volunteers
  const userIds = [...new Set((requests || []).map(r => r.user_id))]

  const { data: authUsers } = await admin.auth.admin.listUsers({ perPage: 1000 })
  const emailMap: Record<string, string> = {}
  for (const u of authUsers?.users || []) {
    if (u.email) emailMap[u.id] = u.email
  }

  // Get volunteer names/photos
  const { data: volunteers } = userIds.length > 0
    ? await admin.from('it_manager.volunteers').select('id, name, photo_url').in('id', userIds)
    : { data: [] }

  const volMap: Record<string, { name?: string; photo_url?: string }> = {}
  for (const v of volunteers || []) {
    volMap[v.id] = { name: v.name, photo_url: v.photo_url }
  }

  const enriched = (requests || []).map(r => ({
    ...r,
    user_email: emailMap[r.user_id] || null,
    user_name: volMap[r.user_id]?.name || null,
    user_photo: volMap[r.user_id]?.photo_url || null,
    project_name: (r.projects as { name: string } | null)?.name || r.project_slug,
  }))

  return NextResponse.json({ data: enriched })
}
