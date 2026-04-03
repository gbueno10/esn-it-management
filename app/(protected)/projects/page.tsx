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
        <h1 className="text-2xl font-bold">Projects</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage all ESN projects registered in Supabase
        </p>
      </div>
      <ProjectsTable initialProjects={(projects || []) as Project[]} isAdmin={isAdmin} />
    </div>
  )
}
