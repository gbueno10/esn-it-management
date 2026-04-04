import { createClient } from '@/lib/supabase/server'
import { createPublicClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isProjectAdmin } from '@/lib/auth/permissions'
import { AppsAndTools } from '@/components/volunteer/AppsAndTools'
import { Project, Tool } from '@/types'
import { redirect } from 'next/navigation'

export default async function VolunteerAppsPage() {
  const supabase = await createPublicClient()
  const itManager = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const isAdmin = await isProjectAdmin()

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
    .neq('status', 'inactive')
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

  // Fetch tools
  const { data: tools } = await itManager
    .from('tools')
    .select('*')
    .order('name')

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">My Apps</h1>
        <p className="text-[13px] text-muted-foreground mt-1">
          Apps, tools and resources for ESN volunteers
        </p>
      </div>
      <AppsAndTools
        projects={(projects || []) as Project[]}
        userAccessSlugs={userAccessSlugs}
        userAdminSlugs={userAdminSlugs}
        pendingRequestSlugs={pendingRequestSlugs}
        userRole={userRole}
        tools={(tools || []) as Tool[]}
        isAdmin={isAdmin}
      />
    </div>
  )
}
