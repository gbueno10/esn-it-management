import { createClient } from '@/lib/supabase/server'
import { createPublicClient } from '@/lib/supabase/server'
import { isProjectAdmin } from '@/lib/auth/permissions'
import { ProjectsGrid } from '@/components/projects/ProjectsGrid'
import { ToolsGrid } from '@/components/tools/ToolsGrid'
import { ProjectsAndTools } from '@/components/projects/ProjectsAndTools'
import { Project, Tool } from '@/types'

export default async function ProjectsPage() {
  const supabase = await createPublicClient()
  const itManager = await createClient()
  const isAdmin = await isProjectAdmin()

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('name')

  // Fetch tools (from it_manager schema)
  const { data: tools } = await itManager
    .from('tools')
    .select('*')
    .order('name')

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
        <p className="text-[13px] text-muted-foreground mt-1">
          Manage all ESN projects and tools
        </p>
      </div>

      <ProjectsAndTools
        projects={(projects || []) as Project[]}
        tools={(tools || []) as Tool[]}
        isAdmin={isAdmin}
      />
    </div>
  )
}
