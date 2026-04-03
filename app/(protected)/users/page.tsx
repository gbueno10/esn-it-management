import { createPublicClient } from '@/lib/supabase/server'
import { createAdminClient, getAuthEmailMap } from '@/lib/supabase/admin'
import { isProjectAdmin } from '@/lib/auth/permissions'
import { UsersTable } from '@/components/users/UsersTable'
import { GlobalAdmins } from '@/components/users/GlobalAdmins'
import { UsersByProject } from '@/components/users/UsersByProject'
import { redirect } from 'next/navigation'

export default async function UsersPage() {
  const supabase = await createPublicClient()
  const isAdmin = await isProjectAdmin()

  // Verify user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Use admin client to bypass RLS for profile queries
  const admin = createAdminClient()

  // Get email map from auth.users
  const emailMap = await getAuthEmailMap()

  // Fetch profiles and access separately (no FK join available)
  const { data: allProfiles } = await admin
    .from('profiles')
    .select('id, name, role, created_at')
    .order('created_at', { ascending: false })

  const { data: allAccess } = await admin
    .from('user_project_access')
    .select('user_id, project_slug, role')
    .is('revoked_at', null)

  // Count projects per user
  const projectCountMap: Record<string, number> = {}
  for (const a of allAccess || []) {
    const uid = a.user_id as string
    projectCountMap[uid] = (projectCountMap[uid] || 0) + 1
  }

  // Merge emails + project counts
  const usersWithEmails = (allProfiles || []).map((p) => ({
    id: p.id as string,
    name: p.name as string | null,
    email: emailMap[p.id as string] || null,
    role: p.role as string,
    created_at: p.created_at as string,
    project_count: projectCountMap[p.id as string] || 0,
  }))

  // Global admins
  const admins = usersWithEmails.filter((u) => u.role === 'admin')

  // Fetch projects
  const { data: projects } = await admin
    .from('projects')
    .select('slug, name, access_level, is_active')
    .eq('is_active', true)
    .order('name')

  // Reuse allAccess for project grouping
  const accessEntries = allAccess

  // Build user lookup
  const userLookup: Record<string, { id: string; name: string | null; email: string | null; esn_role: string }> = {}
  for (const u of usersWithEmails) {
    userLookup[u.id] = { id: u.id, name: u.name, email: u.email, esn_role: u.role }
  }

  // Group users by project
  const projectUsers = (projects || []).map((p) => {
    const users = (accessEntries || [])
      .filter((e) => e.project_slug === p.slug)
      .map((e) => {
        const u = userLookup[e.user_id as string]
        return u
          ? { ...u, project_role: e.role as string }
          : { id: e.user_id as string, name: null, email: emailMap[e.user_id as string] || null, esn_role: 'unknown', project_role: e.role as string }
      })
    return { slug: p.slug as string, name: p.name as string, access_level: p.access_level as string, users }
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage users, ESN roles, and project access permissions
        </p>
      </div>

      <GlobalAdmins admins={admins} isAdmin={isAdmin} />
      <UsersByProject projects={projectUsers} />

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">All Users</h2>
        <UsersTable initialUsers={usersWithEmails} isAdmin={isAdmin} />
      </div>
    </div>
  )
}
