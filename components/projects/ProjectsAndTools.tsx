'use client'

import { useState } from 'react'
import { Project, Tool } from '@/types'
import { ProjectsGrid } from '@/components/projects/ProjectsGrid'
import { ToolsGrid } from '@/components/tools/ToolsGrid'
import { cn } from '@/lib/utils'

interface Props {
  projects: Project[]
  tools: Tool[]
  isAdmin: boolean
}

export function ProjectsAndTools({ projects, tools, isAdmin }: Props) {
  const [tab, setTab] = useState<'projects' | 'tools'>('projects')

  return (
    <div>
      <div className="flex gap-1 border-b mb-6">
        <TabButton active={tab === 'projects'} onClick={() => setTab('projects')}>
          Projects ({projects.length})
        </TabButton>
        <TabButton active={tab === 'tools'} onClick={() => setTab('tools')}>
          Tools ({tools.length})
        </TabButton>
      </div>

      {tab === 'projects' && (
        <ProjectsGrid initialProjects={projects} isAdmin={isAdmin} />
      )}
      {tab === 'tools' && (
        <ToolsGrid tools={tools} isAdmin={isAdmin} />
      )}
    </div>
  )
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 pb-2.5 text-[13px] font-medium transition-colors relative',
        active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
      )}
    >
      {children}
      {active && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground rounded-full" />}
    </button>
  )
}
