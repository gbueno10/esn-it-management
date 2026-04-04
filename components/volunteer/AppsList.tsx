'use client'

import { useState } from 'react'
import { Project } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AccessLevelBadge } from '@/components/ui/role-badges'
import { CheckCircle, Lock, Globe, ExternalLink, FolderKanban, Clock, SendHorizonal, Shield, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface AppsListProps {
  projects: Project[]
  userAccessSlugs: Set<string>
  userAdminSlugs: Set<string>
  pendingRequestSlugs: Set<string>
  userRole: string
}

function getProjectGradient(slug: string) {
  const gradients = [
    'from-[var(--esn-blue)] to-[var(--esn-pink)]',
    'from-[var(--esn-green)] to-[var(--esn-blue)]',
    'from-[var(--esn-orange)] to-[var(--esn-pink)]',
    'from-[var(--esn-pink)] to-[var(--esn-dark)]',
    'from-[var(--esn-blue)] to-[var(--esn-green)]',
    'from-[var(--esn-dark)] to-[var(--esn-blue)]',
  ]
  let hash = 0
  for (let i = 0; i < slug.length; i++) hash = slug.charCodeAt(i) + ((hash << 5) - hash)
  return gradients[Math.abs(hash) % gradients.length]
}

export function AppsList({ projects, userAccessSlugs, userAdminSlugs, pendingRequestSlugs, userRole }: AppsListProps) {
  const [pendingSlugs, setPendingSlugs] = useState(pendingRequestSlugs)

  function getAccessStatus(project: Project) {
    if (userAccessSlugs.has(project.slug)) {
      return { status: 'access', label: userAdminSlugs.has(project.slug) ? 'Admin' : 'You have access', icon: CheckCircle, color: 'text-green-600' }
    }
    if (project.access_level === 'public') {
      return { status: 'access', label: 'Public', icon: Globe, color: 'text-green-600' }
    }
    if (project.access_level === 'staff_only' && (userRole === 'volunteer' || userRole === 'admin')) {
      return { status: 'access', label: 'Staff access', icon: CheckCircle, color: 'text-green-600' }
    }
    if (project.access_level === 'admin_only' && userRole === 'admin') {
      return { status: 'access', label: 'Admin access', icon: CheckCircle, color: 'text-green-600' }
    }
    if (pendingSlugs.has(project.slug)) {
      return { status: 'pending', label: 'Pending', icon: Clock, color: 'text-amber-600' }
    }
    return { status: 'locked', label: 'No access', icon: Lock, color: 'text-muted-foreground' }
  }

  async function handleRequest(slug: string, requestedRole: 'user' | 'admin') {
    const res = await fetch('/api/volunteer/access-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_slug: slug, requested_role: requestedRole }),
    })
    if (res.ok) {
      setPendingSlugs(new Set([...pendingSlugs, slug]))
      toast.success(requestedRole === 'admin' ? 'Admin access requested!' : 'Access requested! An admin will review it.')
    } else {
      const { error } = await res.json().catch(() => ({ error: 'Request failed' }))
      toast.error(error)
    }
  }

  const withAccess = projects.filter((p) => getAccessStatus(p).status === 'access')
  const withoutAccess = projects.filter((p) => getAccessStatus(p).status !== 'access')

  return (
    <div className="space-y-8">
      {withAccess.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-4">
            Your Apps ({withAccess.length})
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {withAccess.map((project) => (
              <ProjectCard
                key={project.slug}
                project={project}
                access={getAccessStatus(project)}
                isAdmin={userAdminSlugs.has(project.slug)}
                hasPendingRequest={pendingSlugs.has(project.slug)}
                onRequestAdmin={(slug) => handleRequest(slug, 'admin')}
              />
            ))}
          </div>
        </div>
      )}

      {withoutAccess.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-4">
            Other Apps ({withoutAccess.length})
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {withoutAccess.map((project) => (
              <ProjectCard
                key={project.slug}
                project={project}
                access={getAccessStatus(project)}
                locked
                hasPendingRequest={pendingSlugs.has(project.slug)}
                onRequestAccess={(slug) => handleRequest(slug, 'user')}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ProjectCard({ project, access, locked, isAdmin, hasPendingRequest, onRequestAccess, onRequestAdmin }: {
  project: Project
  access: { status: string; label: string; icon: React.ComponentType<{ className?: string }>; color: string }
  locked?: boolean
  isAdmin?: boolean
  hasPendingRequest?: boolean
  onRequestAccess?: (slug: string) => Promise<void>
  onRequestAdmin?: (slug: string) => Promise<void>
}) {
  const [requesting, setRequesting] = useState(false)
  const Icon = access.icon
  const hasImage = !!project.image_url
  const isPending = access.status === 'pending' || (hasPendingRequest && !locked)
  const canRequestAccess = locked && !isPending && onRequestAccess && project.allow_access_requests
  const canRequestAdmin = !locked && !isAdmin && !hasPendingRequest && onRequestAdmin && project.allow_admin_requests
  const Wrapper = project.app_url && !locked ? 'a' : 'div'
  const wrapperProps = project.app_url && !locked
    ? { href: project.app_url, target: '_blank', rel: 'noopener noreferrer' }
    : {}

  async function handleRequest(e: React.MouseEvent, fn: (slug: string) => Promise<void>) {
    e.preventDefault()
    e.stopPropagation()
    if (requesting) return
    setRequesting(true)
    await fn(project.slug)
    setRequesting(false)
  }

  return (
    <Wrapper {...wrapperProps}>
      <Card className={cn(
        'overflow-hidden transition-all group',
        locked && !isPending ? 'opacity-50 hover:opacity-75' : locked ? 'opacity-70' : 'hover:border-primary/30 hover:shadow-md',
        project.app_url && !locked && 'cursor-pointer'
      )}>
        <div className="h-28 relative overflow-hidden">
          {hasImage ? (
            <img
              src={project.image_url}
              alt={project.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className={cn('w-full h-full bg-gradient-to-br', getProjectGradient(project.slug))}>
              <div className="absolute inset-0 flex items-center justify-center">
                <FolderKanban className="h-10 w-10 text-white/30" />
              </div>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <span className={cn(
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold backdrop-blur-sm',
              access.status === 'access'
                ? isAdmin
                  ? 'bg-purple-500/20 text-purple-100 border border-purple-400/30'
                  : 'bg-green-500/20 text-green-100 border border-green-400/30'
                : isPending
                  ? 'bg-amber-500/20 text-amber-100 border border-amber-400/30'
                  : 'bg-black/30 text-white/70 border border-white/20'
            )}>
              <Icon className="h-3 w-3" />
              {access.label}
            </span>
          </div>
        </div>

        <CardContent className="pt-3 pb-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold truncate">{project.name}</h4>
              {project.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{project.description}</p>
              )}
            </div>
            {project.app_url && !locked && (
              <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5 group-hover:text-primary transition-colors" />
            )}
          </div>
          <div className="flex items-center justify-between gap-2 mt-2.5">
            <AccessLevelBadge level={project.access_level} />

            {/* Locked project: request access */}
            {canRequestAccess && (
              <Button size="sm" variant="outline" onClick={(e) => handleRequest(e, onRequestAccess)} disabled={requesting} className="h-7 text-xs">
                {requesting ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <SendHorizonal className="h-3 w-3 mr-1" />}
                Request Access
              </Button>
            )}

            {/* Has access but not admin: request admin */}
            {canRequestAdmin && (
              <Button size="sm" variant="outline" onClick={(e) => handleRequest(e, onRequestAdmin)} disabled={requesting} className="h-7 text-xs">
                {requesting ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Shield className="h-3 w-3 mr-1" />}
                Request Admin
              </Button>
            )}

            {/* Pending request */}
            {isPending && (
              <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium">
                <Clock className="h-3 w-3" /> Pending review
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Wrapper>
  )
}
