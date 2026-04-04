'use client'

import { useState } from 'react'
import { Project, Tool } from '@/types'
import { AppsList } from '@/components/volunteer/AppsList'
import { ToolsGrid } from '@/components/tools/ToolsGrid'
import { cn } from '@/lib/utils'

interface AppsAndToolsProps {
  projects: Project[]
  userAccessSlugs: Set<string>
  userAdminSlugs: Set<string>
  pendingRequestSlugs: Set<string>
  userRole: string
  tools: Tool[]
  isAdmin: boolean
}

export function AppsAndTools({ projects, userAccessSlugs, userAdminSlugs, pendingRequestSlugs, userRole, tools, isAdmin }: AppsAndToolsProps) {
  const [tab, setTab] = useState<'apps' | 'tools'>('apps')

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 border-b mb-6">
        <TabButton active={tab === 'apps'} onClick={() => setTab('apps')}>
          Apps ({projects.length})
        </TabButton>
        <TabButton active={tab === 'tools'} onClick={() => setTab('tools')}>
          Tools ({tools.length})
        </TabButton>
      </div>

      {/* Content */}
      {tab === 'apps' && (
        <AppsList
          projects={projects}
          userAccessSlugs={userAccessSlugs}
          userAdminSlugs={userAdminSlugs}
          pendingRequestSlugs={pendingRequestSlugs}
          userRole={userRole}
        />
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
        active
          ? 'text-foreground'
          : 'text-muted-foreground hover:text-foreground'
      )}
    >
      {children}
      {active && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground rounded-full" />
      )}
    </button>
  )
}
