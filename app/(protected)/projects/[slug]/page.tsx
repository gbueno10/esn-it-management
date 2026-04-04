import { createPublicClient } from '@/lib/supabase/server'
import { createAdminClient, getAuthEmailMap } from '@/lib/supabase/admin'
import { isProjectAdmin } from '@/lib/auth/permissions'
import { Project } from '@/types'
import { ProjectDetail } from '@/components/projects/ProjectDetail'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createPublicClient()
  const isAdmin = await isProjectAdmin()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch project
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!project) {
    return (
      <div className="text-center py-16">
        <h2 className="text-lg font-semibold">Project not found</h2>
        <Link href="/projects" className="text-sm text-primary hover:underline mt-2 inline-block">Back to projects</Link>
      </div>
    )
  }

  // Check user's access to this project
  const admin = createAdminClient()
  const { data: userAccess } = await admin
    .from('user_project_access')
    .select('role')
    .eq('user_id', user.id)
    .eq('project_slug', slug)
    .is('revoked_at', null)
    .maybeSingle()

  // Check pending request
  const { data: pendingRequest } = await supabase
    .from('access_requests')
    .select('id')
    .eq('user_id', user.id)
    .eq('project_slug', slug)
    .eq('status', 'pending')
    .maybeSingle()

  // Get user's ESN role
  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const userRole = (profile?.role as string) || 'student'

  // Admin: fetch project users
  let projectUsers: { id: string; name: string | null; email: string | null; esn_role: string; project_role: string }[] = []

  if (isAdmin) {
    const emailMap = await getAuthEmailMap()

    const { data: accessEntries } = await admin
      .from('user_project_access')
      .select('user_id, role')
      .eq('project_slug', slug)
      .is('revoked_at', null)

    const userIds = (accessEntries || []).map(e => e.user_id as string)

    if (userIds.length > 0) {
      const { data: profiles } = await admin
        .from('profiles')
        .select('id, name, role')
        .in('id', userIds)

      const profileMap: Record<string, { name: string | null; role: string }> = {}
      for (const p of profiles || []) {
        profileMap[p.id as string] = { name: p.name as string | null, role: p.role as string }
      }

      projectUsers = (accessEntries || []).map(e => {
        const uid = e.user_id as string
        const p = profileMap[uid]
        return {
          id: uid,
          name: p?.name || null,
          email: emailMap[uid] || null,
          esn_role: p?.role || 'unknown',
          project_role: e.role as string,
        }
      })
    }
  }

  return (
    <div className="animate-fade-in-up">
      <Link href="/projects">
        <Button variant="ghost" size="sm" className="mb-6 text-[12px]">
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          Projects
        </Button>
      </Link>

      <ProjectDetail
        project={project as Project}
        isAdmin={isAdmin}
        userRole={userRole}
        userAccess={userAccess ? (userAccess.role as string) : null}
        hasPendingRequest={!!pendingRequest}
        projectUsers={projectUsers}
      />
    </div>
  )
}
