'use client'

import { useState } from 'react'
import { Project, UserProjectAccess } from '@/types'

interface UserProfile {
  id: string
  name: string | null
  email: string | null
  role: 'student' | 'volunteer' | 'admin'
  created_at: string
}
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Label } from '@/components/ui/label'
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogClose, DialogDescription, DialogHeader, DialogFooter } from '@/components/ui/dialog'
import { RoleBadge, AccessLevelBadge, ProjectRoleBadge } from '@/components/ui/role-badges'
import { EmptyState } from '@/components/ui/empty-state'
import { formatRelativeTime } from '@/lib/utils'
import { Plus, Lock, Trash2 } from 'lucide-react'

interface AccessWithProject extends UserProjectAccess {
  projects: { name: string; access_level: string; is_active: boolean } | null
}

interface UserDetailProps {
  user: UserProfile
  access: AccessWithProject[]
  allProjects: Project[]
  isAdmin: boolean
}

export function UserDetail({ user, access: initialAccess, allProjects, isAdmin }: UserDetailProps) {
  const [access, setAccess] = useState(initialAccess)
  const [loading, setLoading] = useState(false)
  const [currentRole, setCurrentRole] = useState(user.role)

  const accessibleSlugs = new Set(access.map((a) => a.project_slug))
  const availableProjects = allProjects.filter((p) => !accessibleSlugs.has(p.slug))

  async function handleRoleChange(newRole: string) {
    setLoading(true)
    const res = await fetch(`/api/users/${user.id}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    })
    if (res.ok) setCurrentRole(newRole as UserProfile['role'])
    setLoading(false)
  }

  async function handleAddAccess(projectSlug: string, role: string) {
    setLoading(true)
    const res = await fetch(`/api/users/${user.id}/access`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_slug: projectSlug, role }),
    })
    if (res.ok) {
      const accessRes = await fetch(`/api/users/${user.id}/access`)
      if (accessRes.ok) {
        const { data } = await accessRes.json()
        setAccess(data)
      }
    }
    setLoading(false)
  }

  async function handleChangeProjectRole(accessId: string, newRole: string) {
    await fetch(`/api/users/${user.id}/access/${accessId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    })
    setAccess(access.map((a) => (a.id === accessId ? { ...a, role: newRole as UserProjectAccess['role'] } : a)))
  }

  async function handleRevokeAccess(accessId: string) {
    const res = await fetch(`/api/users/${user.id}/access/${accessId}`, { method: 'DELETE' })
    if (res.ok) setAccess(access.filter((a) => a.id !== accessId))
  }

  return (
    <div className="space-y-6">
      {/* User Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-xl font-bold text-muted-foreground">
              {(user.name || user.email || '?')[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold">{user.name || 'No name'}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="flex items-center gap-3 mt-3">
                {isAdmin ? (
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">ESN Role:</Label>
                    <select value={currentRole} onChange={(e) => handleRoleChange(e.target.value)} disabled={loading} className="text-sm border rounded-lg px-2 py-1 bg-card">
                      <option value="student">Student</option>
                      <option value="volunteer">Volunteer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                ) : (
                  <RoleBadge role={currentRole} />
                )}
                <span className="text-xs text-muted-foreground">Registered {formatRelativeTime(user.created_at)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Access */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Project Access</h3>
          {isAdmin && availableProjects.length > 0 && (
            <AddAccessDialog onSubmit={handleAddAccess} projects={availableProjects} loading={loading} />
          )}
        </div>

        {access.length === 0 ? (
          <EmptyState title="No project access" description="This user doesn't have access to any projects yet." icon={<Lock className="h-8 w-8" />} />
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Access</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Since</TableHead>
                  {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {access.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <span className="font-medium">{a.projects?.name || a.project_slug}</span>
                      <code className="ml-2 text-xs bg-muted px-1.5 py-0.5 rounded">{a.project_slug}</code>
                    </TableCell>
                    <TableCell>{a.projects && <AccessLevelBadge level={a.projects.access_level} />}</TableCell>
                    <TableCell>
                      {isAdmin ? (
                        <select value={a.role} onChange={(e) => handleChangeProjectRole(a.id, e.target.value)} className="text-xs border rounded-lg px-2 py-1 bg-card">
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <ProjectRoleBadge role={a.role} />
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">{formatRelativeTime(a.granted_at)}</TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleRevokeAccess(a.id)} className="text-destructive hover:text-destructive">
                          <Trash2 className="h-3 w-3 mr-1" />
                          Revoke
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </div>
  )
}

function AddAccessDialog({ onSubmit, projects, loading }: { onSubmit: (slug: string, role: string) => void; projects: Project[]; loading: boolean }) {
  const [open, setOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState('')
  const [role, setRole] = useState('user')

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button size="sm"><Plus className="h-4 w-4 mr-1" />Add access</Button>
      </DialogTrigger>
      <DialogContent>
          <DialogTitle className="text-lg font-semibold mb-1">Add Project Access</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mb-4">Grant this user access to a project.</DialogDescription>
          <form onSubmit={(e) => { e.preventDefault(); if (selectedProject) { onSubmit(selectedProject, role); setOpen(false) } }} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Project</Label>
              <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} required className="w-full h-9 rounded-md border border-input px-2.5 text-[13px] bg-card outline-none hover:border-foreground/20">
                <option value="" disabled>Select a project...</option>
                {projects.map((p) => <option key={p.slug} value={p.slug}>{p.name} ({p.slug})</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Project Role</Label>
              <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full h-9 rounded-md border border-input px-2.5 text-[13px] bg-card outline-none hover:border-foreground/20">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <DialogClose><Button variant="outline" type="button">Cancel</Button></DialogClose>
              <Button type="submit" disabled={loading || !selectedProject}>{loading ? 'Adding...' : 'Add'}</Button>
            </div>
          </form>
      </DialogContent>
    </Dialog>
  )
}
