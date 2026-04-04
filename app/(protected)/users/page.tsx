import { createPublicClient } from '@/lib/supabase/server'
import { createAdminClient, getAuthEmailMap } from '@/lib/supabase/admin'
import { isProjectAdmin } from '@/lib/auth/permissions'
import { UsersTable } from '@/components/users/UsersTable'
import { redirect } from 'next/navigation'

export default async function UsersPage() {
  const supabase = await createPublicClient()
  const isAdmin = await isProjectAdmin()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const emailMap = await getAuthEmailMap()

  const { data: allProfiles } = await admin
    .from('profiles')
    .select('id, name, role, created_at')
    .order('created_at', { ascending: false })

  const { data: allAccess } = await admin
    .from('user_project_access')
    .select('user_id, project_slug, role')
    .is('revoked_at', null)

  const projectCountMap: Record<string, number> = {}
  for (const a of allAccess || []) {
    projectCountMap[a.user_id as string] = (projectCountMap[a.user_id as string] || 0) + 1
  }

  const usersWithEmails = (allProfiles || []).map((p) => ({
    id: p.id as string,
    name: p.name as string | null,
    email: emailMap[p.id as string] || null,
    role: p.role as string,
    created_at: p.created_at as string,
    project_count: projectCountMap[p.id as string] || 0,
  }))

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="text-[13px] text-muted-foreground mt-1">
          Manage users and ESN roles
        </p>
      </div>
      <UsersTable initialUsers={usersWithEmails} isAdmin={isAdmin} />
    </div>
  )
}
