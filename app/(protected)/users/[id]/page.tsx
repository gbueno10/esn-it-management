import { createPublicClient } from '@/lib/supabase/server'
import { isProjectAdmin } from '@/lib/auth/permissions'
import { UserDetail } from '@/components/users/UserDetail'
import { ESNProfile, Project } from '@/types'
import Link from 'next/link'

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createPublicClient()
  const isAdmin = await isProjectAdmin()

  // Fetch user profile
  const { data: user } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-semibold text-slate-900">Utilizador não encontrado</h2>
        <Link href="/users" className="text-sm text-[var(--primary)] hover:underline mt-2 inline-block">
          Voltar à lista
        </Link>
      </div>
    )
  }

  // Fetch user's project access with project details
  const { data: access } = await supabase
    .from('user_project_access')
    .select('*, projects:project_slug(name, access_level, is_active)')
    .eq('user_id', id)
    .is('revoked_at', null)
    .order('granted_at', { ascending: false })

  // Fetch all projects for the add access modal
  const { data: allProjects } = await supabase
    .from('projects')
    .select('*')
    .eq('is_active', true)
    .order('name')

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/users"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Voltar
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Detalhes do Utilizador</h1>
      </div>

      <UserDetail
        user={user as ESNProfile}
        access={access || []}
        allProjects={(allProjects || []) as Project[]}
        isAdmin={isAdmin}
      />
    </div>
  )
}
