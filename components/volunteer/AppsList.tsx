'use client'

import { Project } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AccessLevelBadge } from '@/components/ui/role-badges'
import { CheckCircle, Lock, Globe } from 'lucide-react'

interface AppsListProps {
  projects: Project[]
  userAccessSlugs: Set<string>
  userRole: string // 'student' | 'volunteer' | 'admin'
}

export function AppsList({ projects, userAccessSlugs, userRole }: AppsListProps) {
  function getAccessStatus(project: Project) {
    // Explicit access via user_project_access
    if (userAccessSlugs.has(project.slug)) {
      return { status: 'access', label: 'You have access', icon: CheckCircle, color: 'text-green-600' }
    }

    // Role-based access
    if (project.access_level === 'public') {
      return { status: 'access', label: 'Public access', icon: Globe, color: 'text-green-600' }
    }
    if (project.access_level === 'staff_only' && (userRole === 'volunteer' || userRole === 'admin')) {
      return { status: 'access', label: 'Staff access', icon: CheckCircle, color: 'text-green-600' }
    }
    if (project.access_level === 'admin_only' && userRole === 'admin') {
      return { status: 'access', label: 'Admin access', icon: CheckCircle, color: 'text-green-600' }
    }

    // No access
    return { status: 'locked', label: 'No access', icon: Lock, color: 'text-muted-foreground' }
  }

  const withAccess = projects.filter((p) => getAccessStatus(p).status === 'access')
  const withoutAccess = projects.filter((p) => getAccessStatus(p).status !== 'access')

  return (
    <div className="space-y-6">
      {/* Apps with access */}
      {withAccess.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">
            Your Apps ({withAccess.length})
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {withAccess.map((project) => {
              const access = getAccessStatus(project)
              const Icon = access.icon
              return (
                <Card key={project.slug} className="hover:border-primary/30 transition-colors">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">{project.name}</h4>
                        {project.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{project.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <AccessLevelBadge level={project.access_level} />
                          <code className="text-xs text-muted-foreground">{project.slug}</code>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <Icon className={`h-4 w-4 ${access.color}`} />
                        <span className={`text-xs ${access.color}`}>{access.label}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Apps without access */}
      {withoutAccess.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">
            Other Apps ({withoutAccess.length})
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {withoutAccess.map((project) => {
              const access = getAccessStatus(project)
              const Icon = access.icon
              return (
                <Card key={project.slug} className="opacity-60">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">{project.name}</h4>
                        {project.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{project.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <AccessLevelBadge level={project.access_level} />
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <Icon className={`h-4 w-4 ${access.color}`} />
                        <span className={`text-xs ${access.color}`}>{access.label}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
