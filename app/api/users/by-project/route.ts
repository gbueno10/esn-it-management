import { createPublicClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/users/by-project - Get users grouped by project
export async function GET() {
  const supabase = await createPublicClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get all projects
  const { data: projects } = await supabase
    .from('projects')
    .select('slug, name, access_level, is_active')
    .order('name')

  // Get all active access entries with profile info
  const { data: accessEntries } = await supabase
    .from('user_project_access')
    .select('user_id, project_slug, role, profiles:user_id(id, name, email, role)')
    .is('revoked_at', null)

  // Group by project
  const byProject: Record<string, {
    project: { slug: string; name: string; access_level: string; is_active: boolean }
    users: { id: string; name: string | null; email: string | null; esn_role: string; project_role: string }[]
  }> = {}

  for (const project of projects || []) {
    byProject[project.slug] = { project, users: [] }
  }

  for (const entry of accessEntries || []) {
    const profile = entry.profiles as unknown as { id: string; name: string | null; email: string | null; role: string } | null
    if (profile && byProject[entry.project_slug]) {
      byProject[entry.project_slug].users.push({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        esn_role: profile.role,
        project_role: entry.role,
      })
    }
  }

  return NextResponse.json({ data: Object.values(byProject) })
}
