import { createPublicClient } from '@/lib/supabase/server'
import { isProjectAdmin } from '@/lib/auth/permissions'
import { UsersTable } from '@/components/users/UsersTable'

export default async function UsersPage() {
  const supabase = await createPublicClient()
  const isAdmin = await isProjectAdmin()

  const { data: users } = await supabase
    .from('profiles')
    .select('*, user_project_access(*)')
    .order('created_at', { ascending: false })

  const usersWithCount = (users || []).map((profile) => ({
    ...profile,
    project_count: (profile.user_project_access || []).filter(
      (a: { revoked_at: string | null }) => !a.revoked_at
    ).length,
  }))

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Utilizadores</h1>
        <p className="text-sm text-slate-500 mt-1">
          Gerir utilizadores, roles ESN e permissões de acesso a projetos
        </p>
      </div>

      <UsersTable initialUsers={usersWithCount} isAdmin={isAdmin} />
    </div>
  )
}
