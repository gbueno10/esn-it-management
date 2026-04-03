import { createPublicClient } from '@/lib/supabase/server'
import { isProjectAdmin } from '@/lib/auth/permissions'
import { ProjectsTable } from '@/components/projects/ProjectsTable'
import { Project } from '@/types'

export default async function ProjectsPage() {
  const supabase = await createPublicClient()
  const isAdmin = await isProjectAdmin()

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Projetos</h1>
        <p className="text-sm text-slate-500 mt-1">
          Gerir todos os projetos ESN registados no Supabase
        </p>
      </div>

      <ProjectsTable
        initialProjects={(projects || []) as Project[]}
        isAdmin={isAdmin}
      />
    </div>
  )
}
