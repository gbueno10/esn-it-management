'use client'

import { useState } from 'react'
import { Project, CreateProjectInput, UpdateProjectInput } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogClose, DialogDescription, DialogHeader, DialogFooter } from '@/components/ui/dialog'
import { AccessLevelBadge } from '@/components/ui/role-badges'
import { EmptyState } from '@/components/ui/empty-state'
import { formatRelativeTime } from '@/lib/utils'
import { Plus, Pencil, FolderKanban, Image, ExternalLink } from 'lucide-react'

interface ProjectsTableProps {
  initialProjects: Project[]
  isAdmin: boolean
}

const accessLevelOptions = [
  { value: 'public', label: 'Public' },
  { value: 'staff_only', label: 'Staff Only' },
  { value: 'admin_only', label: 'Admin Only' },
  { value: 'custom', label: 'Custom' },
]

export function ProjectsTable({ initialProjects, isAdmin }: ProjectsTableProps) {
  const [projects, setProjects] = useState(initialProjects)
  const [filter, setFilter] = useState<string>('all')
  const [error, setError] = useState('')

  const filtered = filter === 'all'
    ? projects
    : filter === 'active'
      ? projects.filter((p) => p.is_active)
      : filter === 'inactive'
        ? projects.filter((p) => !p.is_active)
        : projects.filter((p) => p.access_level === filter)

  async function handleCreate(input: CreateProjectInput) {
    setError('')
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    const json = await res.json()
    if (!res.ok) { setError(json.error); return false }
    setProjects([json.data, ...projects])
    return true
  }

  async function handleUpdate(slug: string, input: UpdateProjectInput) {
    setError('')
    const res = await fetch(`/api/projects/${slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    const json = await res.json()
    if (!res.ok) { setError(json.error); return false }
    setProjects(projects.map((p) => (p.slug === slug ? json.data : p)))
    return true
  }

  async function handleToggleActive(project: Project) {
    await handleUpdate(project.slug, { is_active: !project.is_active })
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-sm border rounded-lg px-3 py-2 bg-card"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="public">Public</option>
            <option value="staff_only">Staff Only</option>
            <option value="admin_only">Admin Only</option>
            <option value="custom">Custom</option>
          </select>
          <span className="text-sm text-muted-foreground">{filtered.length} projects</span>
        </div>
        {isAdmin && (
          <ProjectFormDialog onSubmit={handleCreate} title="New Project">
            <Button>
              <Plus className="h-4 w-4 mr-1" />
              New Project
            </Button>
          </ProjectFormDialog>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-lg">{error}</div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          title="No projects found"
          description="Create your first project to get started."
          icon={<FolderKanban className="h-8 w-8" />}
        />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Access</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Signup</TableHead>
                <TableHead>Created</TableHead>
                {isAdmin && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((project) => (
                <TableRow key={project.slug}>
                  <TableCell>
                    <div>
                      <span className="font-medium">{project.name}</span>
                      {project.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-xs">{project.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-0.5 rounded">{project.slug}</code>
                  </TableCell>
                  <TableCell><AccessLevelBadge level={project.access_level} /></TableCell>
                  <TableCell>
                    {isAdmin ? (
                      <button
                        onClick={() => handleToggleActive(project)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors ${
                          project.is_active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${project.is_active ? 'bg-green-500' : 'bg-muted-foreground/50'}`} />
                        {project.is_active ? 'Active' : 'Inactive'}
                      </button>
                    ) : (
                      <Badge variant={project.is_active ? 'default' : 'secondary'}>
                        {project.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{project.allow_signup ? 'Yes' : 'No'}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{formatRelativeTime(project.created_at)}</TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <ProjectFormDialog onSubmit={(input) => handleUpdate(project.slug, input)} title={`Edit: ${project.name}`} initial={project}>
                        <Button variant="ghost" size="sm">
                          <Pencil className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </ProjectFormDialog>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}

function ProjectFormDialog({
  onSubmit,
  title,
  initial,
  children,
}: {
  onSubmit: (input: CreateProjectInput & UpdateProjectInput) => Promise<boolean>
  title: string
  initial?: Project
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [slug, setSlug] = useState(initial?.slug || '')
  const [name, setName] = useState(initial?.name || '')
  const [description, setDescription] = useState(initial?.description || '')
  const [imageUrl, setImageUrl] = useState(initial?.image_url || '')
  const [appUrl, setAppUrl] = useState(initial?.app_url || '')
  const [accessLevel, setAccessLevel] = useState<string>(initial?.access_level || 'staff_only')
  const [allowSignup, setAllowSignup] = useState(initial?.allow_signup ?? false)
  const [allowAccessRequests, setAllowAccessRequests] = useState(initial?.allow_access_requests ?? false)
  const [allowAdminRequests, setAllowAdminRequests] = useState(initial?.allow_admin_requests ?? false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const success = await onSubmit({
      slug,
      name,
      description: description || undefined,
      image_url: imageUrl || undefined,
      app_url: appUrl || undefined,
      access_level: accessLevel as CreateProjectInput['access_level'],
      allow_signup: allowSignup,
      allow_access_requests: allowAccessRequests,
      allow_admin_requests: allowAdminRequests,
    })
    setLoading(false)
    if (success) setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children as React.ReactElement} />
      <DialogContent className="sm:max-w-lg">
          <DialogTitle className="text-lg font-semibold mb-1">{title}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mb-4">
            {initial ? 'Update project details.' : 'Register a new ESN project.'}
          </DialogDescription>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!initial && (
              <div className="space-y-1.5">
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" placeholder="my_project" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} required />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="My Project" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="desc">Description</Label>
              <Textarea id="desc" placeholder="Project description..." rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="image_url" className="flex items-center gap-1.5"><Image className="h-3.5 w-3.5" /> Cover Image URL</Label>
              <Input id="image_url" placeholder="https://example.com/image.png" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="app_url" className="flex items-center gap-1.5"><ExternalLink className="h-3.5 w-3.5" /> App URL</Label>
              <Input id="app_url" placeholder="https://myapp.esnporto.org" value={appUrl} onChange={(e) => setAppUrl(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="access">Access Level</Label>
              <select id="access" value={accessLevel} onChange={(e) => setAccessLevel(e.target.value)} className="w-full h-8 rounded-lg border px-2.5 text-sm bg-card">
                {accessLevelOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="space-y-2.5 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={allowSignup} onChange={(e) => setAllowSignup(e.target.checked)} className="w-4 h-4 rounded border-input" />
                <span className="text-sm">Allow signup</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={allowAccessRequests} onChange={(e) => setAllowAccessRequests(e.target.checked)} className="w-4 h-4 rounded border-input" />
                <span className="text-sm">Allow access requests</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={allowAdminRequests} onChange={(e) => setAllowAdminRequests(e.target.checked)} className="w-4 h-4 rounded border-input" />
                <span className="text-sm">Allow admin requests</span>
              </label>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <DialogClose>
                <Button variant="outline" type="button">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : initial ? 'Save' : 'Create'}
              </Button>
            </div>
          </form>
      </DialogContent>
    </Dialog>
  )
}
