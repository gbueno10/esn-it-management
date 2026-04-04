'use client'

import { useState } from 'react'
import { Project } from '@/types'
import { Card } from '@/components/ui/card'
import { ProjectStatusBadge } from '@/components/ui/role-badges'
import { CheckCircle, Lock, Globe, Clock, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import Link from 'next/link'
import { getProjectGradient } from '@/components/projects/ProjectsGrid'

interface AppsListProps {
  projects: Project[]
  userAccessSlugs: Set<string>
  userAdminSlugs: Set<string>
  pendingRequestSlugs: Set<string>
  userRole: string
}

export function AppsList({ projects, userAccessSlugs, userAdminSlugs, pendingRequestSlugs, userRole }: AppsListProps) {
  const [pendingSlugs, setPendingSlugs] = useState(pendingRequestSlugs)

  function getAccessStatus(project: Project) {
    if (userAccessSlugs.has(project.slug)) {
      return { status: 'access' as const, label: userAdminSlugs.has(project.slug) ? 'Admin' : 'Access', icon: CheckCircle }
    }
    if (project.access_level === 'public') return { status: 'access' as const, label: 'Public', icon: Globe }
    if (project.access_level === 'staff_only' && (userRole === 'volunteer' || userRole === 'admin')) return { status: 'access' as const, label: 'Staff', icon: CheckCircle }
    if (project.access_level === 'admin_only' && userRole === 'admin') return { status: 'access' as const, label: 'Admin', icon: CheckCircle }
    if (pendingSlugs.has(project.slug)) return { status: 'pending' as const, label: 'Pending', icon: Clock }
    return { status: 'locked' as const, label: 'Locked', icon: Lock }
  }

  function requestAccess(project: Project) {
    toast(`Request access to ${project.name}?`, {
      action: {
        label: 'Request',
        onClick: async () => {
          const res = await fetch('/api/volunteer/access-request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ project_slug: project.slug, requested_role: 'user' }),
          })
          if (res.ok) {
            setPendingSlugs(new Set([...pendingSlugs, project.slug]))
            toast.success('Access requested!')
          } else {
            const { error } = await res.json().catch(() => ({ error: 'Failed' }))
            toast.error(error)
          }
        },
      },
    })
  }

  const withAccess = projects.filter((p) => getAccessStatus(p).status === 'access' && p.status !== 'development')
  const withoutAccess = projects.filter((p) => getAccessStatus(p).status !== 'access' || p.status === 'development')

  return (
    <div className="space-y-10">
      {withAccess.length > 0 && (
        <div>
          <h3 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Your Apps ({withAccess.length})
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {withAccess.map((project) => {
              const access = getAccessStatus(project)
              return (
                <Link key={project.slug} href={`/projects/${project.slug}`}>
                  <Card className="hover-lift cursor-pointer group p-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {project.image_url ? (
                          <img src={project.image_url} alt={project.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className={cn('w-full h-full bg-gradient-to-br flex items-center justify-center', getProjectGradient(project.slug))}>
                            <span className="text-white/90 text-xl font-bold">{project.name[0]}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-[13px] font-semibold truncate">{project.name}</h4>
                          <ArrowUpRight className="h-3 w-3 text-muted-foreground/0 group-hover:text-muted-foreground/40 transition-colors flex-shrink-0" />
                        </div>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700">
                            <CheckCircle className="h-3 w-3" /> {access.label}
                          </span>
                          {project.status === 'development' && (
                            <ProjectStatusBadge status="development" variant="inline" />
                          )}
                        </div>
                        {project.description && (
                          <p className="text-[12px] text-muted-foreground mt-2 line-clamp-2 leading-relaxed">{project.description}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {withoutAccess.length > 0 && (
        <div>
          <h3 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Other Apps ({withoutAccess.length})
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {withoutAccess.map((project) => {
              const access = getAccessStatus(project)
              const isPending = access.status === 'pending'
              const canRequest = access.status === 'locked' && project.allow_access_requests
              return (
                <LockedAppCard key={project.slug} project={project} access={access} isPending={isPending} canRequest={canRequest} onRequest={() => requestAccess(project)} />
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function LockedAppCard({ project, access, isPending, canRequest, onRequest }: {
  project: Project; access: { label: string; icon: React.ComponentType<{ className?: string }> }; isPending: boolean; canRequest: boolean; onRequest: () => void
}) {
  const AccessIcon = access.icon

  return (
    <Card
      className={cn('group p-4 transition-all', isPending ? 'opacity-70' : 'opacity-50 hover:opacity-75', canRequest && 'cursor-pointer')}
      onClick={canRequest ? onRequest : undefined}
    >
      <div className="flex items-start gap-3.5">
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0 grayscale">
          {project.image_url ? (
            <img src={project.image_url} alt={project.name} className="w-full h-full object-cover" />
          ) : (
            <div className={cn('w-full h-full bg-gradient-to-br flex items-center justify-center opacity-60', getProjectGradient(project.slug))}>
              <span className="text-white/90 text-xl font-bold">{project.name[0]}</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <h4 className="text-[14px] font-semibold truncate">{project.name}</h4>
          {project.description && (
            <p className="text-[12px] text-muted-foreground mt-0.5 line-clamp-1 leading-relaxed">{project.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2.5">
            <span className={cn('inline-flex items-center gap-1 text-[10px] font-medium', isPending ? 'text-amber-600' : 'text-muted-foreground')}>
              <AccessIcon className="h-3 w-3" /> {access.label}
            </span>
            {canRequest && (
              <span className="text-[10px] font-medium text-primary ml-auto">
                Request Access
              </span>
            )}
            {project.status === 'development' && (
              <ProjectStatusBadge status="development" variant="inline" />
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
