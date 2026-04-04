import { createPublicClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { AppsList } from '@/components/volunteer/AppsList'
import { Project } from '@/types'
import { redirect } from 'next/navigation'

export default async function VolunteerAppsPage() {
  const supabase = await createPublicClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()

  // Get user's ESN role
  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const userRole = (profile?.role as string) || 'student'

  // Get all active projects
  const { data: projects } = await admin
    .from('projects')
    .select('*')
    .eq('is_active', true)
    .order('name')

  // Get user's explicit project access (with roles)
  const { data: access } = await admin
    .from('user_project_access')
    .select('project_slug, role')
    .eq('user_id', user.id)
    .is('revoked_at', null)

  const userAccessSlugs = new Set((access || []).map((a) => a.project_slug as string))
  const userAdminSlugs = new Set((access || []).filter((a) => a.role === 'admin').map((a) => a.project_slug as string))

  // Get user's pending access requests
  const { data: pendingRequests } = await supabase
    .from('access_requests')
    .select('project_slug')
    .eq('user_id', user.id)
    .eq('status', 'pending')

  const pendingRequestSlugs = new Set((pendingRequests || []).map((r) => r.project_slug as string))

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">My Apps</h1>
        <p className="text-sm text-muted-foreground mt-1">
          ESN apps and projects you have access to
        </p>
      </div>
      <AppsList
        projects={(projects || []) as Project[]}
        userAccessSlugs={userAccessSlugs}
        userAdminSlugs={userAdminSlugs}
        pendingRequestSlugs={pendingRequestSlugs}
        userRole={userRole}
      />
    </div>
  )
}
