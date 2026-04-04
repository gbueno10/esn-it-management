'use client'

import { useState } from 'react'
import { Project, CreateProjectInput, ProjectStatus } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { AccessLevelBadge, ProjectStatusBadge } from '@/components/ui/role-badges'
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogClose, DialogDescription } from '@/components/ui/dialog'
import { Plus, ExternalLink, FolderKanban, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import Link from 'next/link'

interface ProjectsGridProps {
  initialProjects: Project[]
  isAdmin: boolean
}

export function getProjectGradient(slug: string) {
  const gradients = [
    'from-[#00AEEF] to-[#0090cc]',
    'from-[#7AC143] to-[#5a9e2f]',
    'from-[#F47B20] to-[#d4641a]',
    'from-[#EC008C] to-[#c40075]',
    'from-[#2E3192] to-[#00AEEF]',
    'from-[#00AEEF] to-[#7AC143]',
  ]
  let hash = 0
  for (let i = 0; i < slug.length; i++) hash = slug.charCodeAt(i) + ((hash << 5) - hash)
  return gradients[Math.abs(hash) % gradients.length]
}

const accessLevelOptions = [
  { value: 'public', label: 'Public' },
  { value: 'staff_only', label: 'Staff Only' },
  { value: 'admin_only', label: 'Admin Only' },
  { value: 'custom', label: 'Custom' },
]

export function ProjectsGrid({ initialProjects, isAdmin }: ProjectsGridProps) {
  const [projects, setProjects] = useState(initialProjects)
  const [filter, setFilter] = useState<string>('all')

  const filtered = filter === 'all'
    ? projects
    : projects.filter((p) => p.status === filter)

  async function handleCreate(input: CreateProjectInput) {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    const json = await res.json()
    if (!res.ok) { toast.error(json.error); return false }
    setProjects([json.data, ...projects])
    toast.success('Project created!')
    return true
  }

  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active', dot: 'bg-emerald-500' },
    { value: 'development', label: 'In Dev', dot: 'bg-amber-500' },
    { value: 'inactive', label: 'Inactive', dot: 'bg-slate-400' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-1.5">
          {filterOptions.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all',
                filter === f.value
                  ? 'bg-foreground text-background shadow-sm'
                  : 'bg-white text-muted-foreground ring-1 ring-border/60 hover:ring-border hover:text-foreground'
              )}
            >
              <span className="flex items-center gap-1.5">
                {f.dot && filter !== f.value && <span className={cn('w-1.5 h-1.5 rounded-full', f.dot)} />}
                {f.label}
              </span>
            </button>
          ))}
          <span className="text-[12px] text-muted-foreground self-center ml-2 font-medium">{filtered.length} projects</span>
        </div>
        {isAdmin && (
          <CreateProjectDialog onSubmit={handleCreate}>
            <Button size="sm">
              <Plus className="h-3.5 w-3.5 mr-1" /> New Project
            </Button>
          </CreateProjectDialog>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <FolderKanban className="h-8 w-8 mx-auto mb-3 opacity-30" />
          <p className="text-[13px]">No projects found</p>
        </div>
      )}
    </div>
  )
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/projects/${project.slug}`}>
      <Card className="hover-lift cursor-pointer group">
        <CardContent className="flex items-start gap-3.5">
          {/* App icon */}
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
            {project.image_url ? (
              <img src={project.image_url} alt={project.name} className="w-full h-full object-cover" />
            ) : (
              <div className={cn('w-full h-full bg-gradient-to-br flex items-center justify-center', getProjectGradient(project.slug))}>
                <span className="text-white/90 text-lg font-semibold">{project.name[0]}</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="text-[13px] font-semibold truncate">{project.name}</h4>
              <ArrowUpRight className="h-3 w-3 text-muted-foreground/0 group-hover:text-muted-foreground/40 transition-colors flex-shrink-0" />
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <ProjectStatusBadge status={project.status} variant="inline" />
              <AccessLevelBadge level={project.access_level} />
            </div>
            {project.description && (
              <p className="text-[12px] text-muted-foreground mt-2 line-clamp-2 leading-relaxed">{project.description}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function CreateProjectDialog({ onSubmit, children }: {
  onSubmit: (input: CreateProjectInput) => Promise<boolean>
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [slug, setSlug] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [appUrl, setAppUrl] = useState('')
  const [accessLevel, setAccessLevel] = useState('staff_only')
  const [allowSignup, setAllowSignup] = useState(false)
  const [allowAccessRequests, setAllowAccessRequests] = useState(false)
  const [allowAdminRequests, setAllowAdminRequests] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const success = await onSubmit({
      slug, name,
      description: description || undefined,
      app_url: appUrl || undefined,
      access_level: accessLevel as CreateProjectInput['access_level'],
      allow_signup: allowSignup,
      allow_access_requests: allowAccessRequests,
      allow_admin_requests: allowAdminRequests,
    })
    setLoading(false)
    if (success) {
      setOpen(false)
      setSlug(''); setName(''); setDescription(''); setAppUrl('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children as React.ReactElement} />
      <DialogContent>
        <DialogTitle className="text-lg font-semibold">New Project</DialogTitle>
        <DialogDescription className="text-[13px] text-muted-foreground mb-4">Register a new ESN project</DialogDescription>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[12px]">Slug</Label>
              <Input placeholder="my_project" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px]">Name</Label>
              <Input placeholder="My Project" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[12px]">Description</Label>
            <Textarea placeholder="What does this project do?" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[12px]">App URL</Label>
              <Input placeholder="https://..." value={appUrl} onChange={(e) => setAppUrl(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px]">Access Level</Label>
              <select value={accessLevel} onChange={(e) => setAccessLevel(e.target.value)} className="w-full h-10 rounded-md border border-input px-3 text-[13px] bg-card outline-none hover:border-foreground/20 focus-visible:border-foreground/30">
                {accessLevelOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 pt-1">
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={allowSignup} onChange={(e) => setAllowSignup(e.target.checked)} className="w-4 h-4 rounded border-input accent-primary" /><span className="text-[13px]">Allow signup</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={allowAccessRequests} onChange={(e) => setAllowAccessRequests(e.target.checked)} className="w-4 h-4 rounded border-input accent-primary" /><span className="text-[13px]">Access requests</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={allowAdminRequests} onChange={(e) => setAllowAdminRequests(e.target.checked)} className="w-4 h-4 rounded border-input accent-primary" /><span className="text-[13px]">Admin requests</span></label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <DialogClose><Button variant="outline" type="button">Cancel</Button></DialogClose>
            <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
