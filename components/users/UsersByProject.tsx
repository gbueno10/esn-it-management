'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AccessLevelBadge } from '@/components/ui/role-badges'
import { FolderKanban, ChevronDown, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface ProjectUser {
  id: string
  name: string | null
  email: string | null
  esn_role: string
  project_role: string
}

interface ProjectWithUsers {
  slug: string
  name: string
  access_level: string
  users: ProjectUser[]
}

interface UsersByProjectProps {
  projects: ProjectWithUsers[]
}

export function UsersByProject({ projects }: UsersByProjectProps) {
  const [expandedProject, setExpandedProject] = useState<string | null>(null)

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Users by Project</h2>
      <div className="space-y-3">
        {projects.map((project) => {
          const isExpanded = expandedProject === project.slug
          const admins = project.users.filter((u) => u.project_role === 'admin')
          const regularUsers = project.users.filter((u) => u.project_role === 'user')

          return (
            <Card key={project.slug}>
              <button
                onClick={() => setExpandedProject(isExpanded ? null : project.slug)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/50 transition-colors text-left rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FolderKanban className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{project.name}</span>
                      <AccessLevelBadge level={project.access_level} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {project.users.length} user{project.users.length !== 1 ? 's' : ''}
                      {admins.length > 0 && (
                        <span> ({admins.length} project admin{admins.length !== 1 ? 's' : ''})</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* User avatars preview */}
                  <div className="hidden sm:flex -space-x-2">
                    {project.users.slice(0, 5).map((user) => (
                      <div
                        key={user.id}
                        className={cn(
                          'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 border-card',
                          user.project_role === 'admin'
                            ? 'bg-destructive/10 text-destructive'
                            : 'bg-muted text-muted-foreground'
                        )}
                        title={user.name || user.email || 'Unknown'}
                      >
                        {(user.name || user.email || '?')[0].toUpperCase()}
                      </div>
                    ))}
                    {project.users.length > 5 && (
                      <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground border-2 border-card">
                        +{project.users.length - 5}
                      </div>
                    )}
                  </div>
                  <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', isExpanded && 'rotate-180')} />
                </div>
              </button>

              {isExpanded && (
                <CardContent className="pt-0 pb-4">
                  {project.users.length === 0 ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground py-4 justify-center">
                      <Users className="h-4 w-4" />
                      No users with explicit access (may be accessible via role-based access)
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>ESN Role</TableHead>
                          <TableHead>Project Role</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {/* Show admins first */}
                        {[...admins, ...regularUsers].map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                                  user.project_role === 'admin' ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'
                                )}>
                                  {(user.name || user.email || '?')[0].toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium truncate">{user.name || 'No name'}</p>
                                  <p className="text-xs text-muted-foreground truncate">{user.email || 'No email'}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={user.esn_role === 'admin' ? 'destructive' : user.esn_role === 'volunteer' ? 'default' : 'secondary'}>
                                {user.esn_role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={user.project_role === 'admin' ? 'destructive' : 'outline'}>
                                {user.project_role === 'admin' ? 'Project Admin' : 'User'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Link href={`/users/${user.id}`}>
                                <Button variant="ghost" size="sm">Details</Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              )}
            </Card>
          )
        })}

        {projects.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No active projects</p>
        )}
      </div>
    </div>
  )
}
