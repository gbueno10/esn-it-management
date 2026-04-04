'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Project, UpdateProjectInput, ProjectStatus } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { AccessLevelBadge, ProjectStatusBadge } from '@/components/ui/role-badges'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogClose, DialogDescription } from '@/components/ui/dialog'
import {
  Pencil, ExternalLink, Globe, Lock, Users, CheckCircle,
  Clock, SendHorizonal, Loader2, ImagePlus, Settings, Database, ChevronDown, ChevronUp, TableIcon, Copy, Check, Maximize2, Minus, Plus as PlusIcon, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import Link from 'next/link'
import { getProjectGradient } from '@/components/projects/ProjectsGrid'

interface ProjectDetailProps {
  project: Project
  isAdmin: boolean
  userRole: string
  userAccess: string | null
  hasPendingRequest: boolean
  projectUsers: { id: string; name: string | null; email: string | null; esn_role: string; project_role: string }[]
}

const accessLevelOptions = [
  { value: 'public', label: 'Public' },
  { value: 'staff_only', label: 'Staff Only' },
  { value: 'admin_only', label: 'Admin Only' },
  { value: 'custom', label: 'Custom' },
]

function getAccessInfo(project: Project, userRole: string, userAccess: string | null, hasPending: boolean) {
  if (userAccess) return { hasAccess: true, label: userAccess === 'admin' ? 'Project Admin' : 'You have access', icon: CheckCircle, color: 'text-emerald-600' }
  if (project.access_level === 'public') return { hasAccess: true, label: 'Public access', icon: Globe, color: 'text-emerald-600' }
  if (project.access_level === 'staff_only' && (userRole === 'volunteer' || userRole === 'admin')) return { hasAccess: true, label: 'Staff access', icon: CheckCircle, color: 'text-emerald-600' }
  if (project.access_level === 'admin_only' && userRole === 'admin') return { hasAccess: true, label: 'Admin access', icon: CheckCircle, color: 'text-emerald-600' }
  if (hasPending) return { hasAccess: false, label: 'Request pending', icon: Clock, color: 'text-amber-600' }
  return { hasAccess: false, label: 'No access', icon: Lock, color: 'text-muted-foreground' }
}

export function ProjectDetail({ project: initialProject, isAdmin, userRole, userAccess, hasPendingRequest, projectUsers }: ProjectDetailProps) {
  const [project, setProject] = useState(initialProject)
  const [pending, setPending] = useState(hasPendingRequest)
  const [requesting, setRequesting] = useState(false)

  const access = getAccessInfo(project, userRole, userAccess, pending)
  const AccessIcon = access.icon
  const admins = projectUsers.filter(u => u.project_role === 'admin')
  const users = projectUsers.filter(u => u.project_role === 'user')

  async function handleUpdate(input: UpdateProjectInput) {
    const res = await fetch(`/api/projects/${project.slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    const json = await res.json()
    if (!res.ok) { toast.error(json.error); return false }
    setProject(json.data)
    toast.success('Project updated!')
    return true
  }

  async function handleRequestAccess() {
    setRequesting(true)
    const res = await fetch('/api/volunteer/access-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_slug: project.slug, requested_role: 'user' }),
    })
    setRequesting(false)
    if (res.ok) { setPending(true); toast.success('Access requested!') }
    else { const { error } = await res.json().catch(() => ({ error: 'Failed' })); toast.error(error) }
  }

  function handleCoverUpdated(url: string) {
    setProject({ ...project, image_url: url })
  }

  return (
    <div className="max-w-2xl space-y-5">
      {/* Main Card */}
      <Card>
        <CardContent className="pt-5">
        {/* Header: icon + name + edit */}
        <div className="flex items-start gap-4 mb-5">
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
            {project.image_url ? (
              <img src={project.image_url} alt={project.name} className="w-full h-full object-cover" />
            ) : (
              <div className={cn('w-full h-full bg-gradient-to-br flex items-center justify-center', getProjectGradient(project.slug))}>
                <span className="text-white/90 text-2xl font-semibold">{project.name[0]}</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h1 className="text-xl font-semibold tracking-tight truncate">{project.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <ProjectStatusBadge status={project.status} variant="inline" />
              <AccessLevelBadge level={project.access_level} />
            </div>
          </div>
          {isAdmin && (
            <EditProjectDialog project={project} onUpdate={handleUpdate} onCoverUpdated={handleCoverUpdated}>
              <Button variant="outline" size="sm" className="flex-shrink-0 text-[12px]">
                <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
              </Button>
            </EditProjectDialog>
          )}
        </div>

        {/* Description */}
        {project.description && (
          <>
            <p className="text-[13px] text-muted-foreground leading-relaxed">{project.description}</p>
            <Separator className="my-5" />
          </>
        )}

        {/* Your access status */}
        <div className="flex items-center gap-2 mb-4">
          <AccessIcon className={cn('h-4 w-4', access.color)} />
          <span className={cn('text-[13px] font-medium', access.color)}>{access.label}</span>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          {access.hasAccess && project.app_url && (
            <a href={project.app_url} target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="text-[12px]">
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                Open App
              </Button>
            </a>
          )}
          {!access.hasAccess && !pending && project.allow_access_requests && (
            <Button size="sm" variant="outline" onClick={handleRequestAccess} disabled={requesting} className="text-[12px]">
              {requesting ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <SendHorizonal className="h-3.5 w-3.5 mr-1.5" />}
              Request Access
            </Button>
          )}
          {pending && (
            <span className="inline-flex items-center gap-1.5 text-[12px] text-amber-600 font-medium">
              <Clock className="h-3.5 w-3.5" /> Request pending review
            </span>
          )}
        </div>

        {/* Admin: technical info */}
        {isAdmin && (
          <>
            <Separator className="my-5" />
            <div className="flex items-center gap-2 mb-3">
              <Settings className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[12px] font-semibold text-muted-foreground">Admin Details</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-[12px]">
              <div>
                <span className="text-muted-foreground">Slug</span>
                <code className="block mt-0.5 text-foreground bg-muted px-2 py-1 rounded-md">{project.slug}</code>
              </div>
              <div>
                <span className="text-muted-foreground">App URL</span>
                <p className="mt-0.5 truncate">{project.app_url || <span className="text-muted-foreground/50">Not set</span>}</p>
              </div>
            </div>
            <div className="flex items-center gap-5 mt-3">
              <SettingDot label="Signup" value={project.allow_signup} />
              <SettingDot label="Access Requests" value={project.allow_access_requests} />
              <SettingDot label="Admin Requests" value={project.allow_admin_requests} />
            </div>
          </>
        )}
        </CardContent>
      </Card>

      {/* Users — admin only */}
      {isAdmin && (
        <Card>
          <CardContent className="pt-5 pb-5">
            <h3 className="text-[13px] font-semibold flex items-center gap-2 mb-4">
              <Users className="h-4 w-4 text-muted-foreground" />
              Users ({projectUsers.length})
            </h3>

            {projectUsers.length === 0 ? (
              <p className="text-[12px] text-muted-foreground text-center py-6">No users with explicit access</p>
            ) : (
              <div className="space-y-0.5">
                {[...admins, ...users].map((u) => (
                  <Link
                    key={u.id}
                    href={`/users/${u.id}`}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/50 transition-colors -mx-1"
                  >
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0',
                      u.project_role === 'admin' ? 'bg-purple-50 text-purple-600' : 'bg-muted text-muted-foreground'
                    )}>
                      {(u.name || u.email || '?')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium truncate">{u.name || 'No name'}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{u.email}</p>
                    </div>
                    <span className={cn(
                      'text-[10px] font-medium px-2 py-0.5 rounded-md',
                      u.project_role === 'admin' ? 'bg-purple-50 text-purple-600 ring-1 ring-purple-200/60' : 'bg-muted text-muted-foreground'
                    )}>
                      {u.project_role === 'admin' ? 'Admin' : 'User'}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Schema — admin only */}
      {isAdmin && (
        <ProjectSchema slug={project.slug} />
      )}
    </div>
  )
}

function SettingDot({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={cn('w-1.5 h-1.5 rounded-full', value ? 'bg-emerald-500' : 'bg-slate-300')} />
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  )
}

function EditProjectDialog({ project, onUpdate, onCoverUpdated, children }: {
  project: Project
  onUpdate: (input: UpdateProjectInput) => Promise<boolean>
  onCoverUpdated: (url: string) => void
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(project.name)
  const [description, setDescription] = useState(project.description || '')
  const [appUrl, setAppUrl] = useState(project.app_url || '')
  const [accessLevel, setAccessLevel] = useState(project.access_level)
  const [status, setStatus] = useState<ProjectStatus>(project.status || 'active')
  const [allowSignup, setAllowSignup] = useState(project.allow_signup)
  const [allowAccessRequests, setAllowAccessRequests] = useState(project.allow_access_requests)
  const [allowAdminRequests, setAllowAdminRequests] = useState(project.allow_admin_requests)
  const [loading, setLoading] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const success = await onUpdate({
      name, description: description || undefined, app_url: appUrl || undefined,
      access_level: accessLevel as UpdateProjectInput['access_level'],
      allow_signup: allowSignup, allow_access_requests: allowAccessRequests,
      allow_admin_requests: allowAdminRequests, status, is_active: status !== 'inactive',
    })
    setLoading(false)
    if (success) setOpen(false)
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Must be an image'); return }
    if (file.size > 5 * 1024 * 1024) { toast.error('Max 5MB'); return }
    setUploadingCover(true)
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch(`/api/projects/${project.slug}/cover`, { method: 'POST', body: formData })
    setUploadingCover(false)
    if (res.ok) {
      const { image_url } = await res.json()
      onCoverUpdated(image_url + '?t=' + Date.now())
      toast.success('Cover updated!')
    } else {
      const { error } = await res.json().catch(() => ({ error: 'Upload failed' }))
      toast.error(error)
    }
    e.target.value = ''
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children as React.ReactElement} />
      <DialogContent>
        <DialogTitle className="text-lg font-semibold">Edit {project.name}</DialogTitle>
        <DialogDescription className="text-[13px] text-muted-foreground mb-4">Update project settings</DialogDescription>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cover upload */}
          <div className="space-y-1.5">
            <Label className="text-[12px]">App Icon</Label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} disabled={uploadingCover} />
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted ring-1 ring-border/60 group-hover:ring-primary/30 transition-all flex-shrink-0">
                {project.image_url ? (
                  <img src={project.image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className={cn('w-full h-full bg-gradient-to-br flex items-center justify-center', getProjectGradient(project.slug))}>
                    <span className="text-white font-bold">{project.name[0]}</span>
                  </div>
                )}
              </div>
              <span className="text-[12px] text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                {uploadingCover ? <><Loader2 className="h-3 w-3 animate-spin" /> Uploading...</> : <><ImagePlus className="h-3.5 w-3.5" /> Upload image</>}
              </span>
            </label>
          </div>
          <div className="space-y-1.5"><Label className="text-[12px]">Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
          <div className="space-y-1.5"><Label className="text-[12px]">Description</Label><Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label className="text-[12px]">App URL</Label><Input placeholder="https://..." value={appUrl} onChange={(e) => setAppUrl(e.target.value)} /></div>
            <div className="space-y-1.5">
              <Label className="text-[12px]">Access Level</Label>
              <select value={accessLevel} onChange={(e) => setAccessLevel(e.target.value as Project['access_level'])} className="w-full h-10 rounded-md border border-input px-3 text-[13px] bg-card outline-none hover:border-foreground/20 focus-visible:border-foreground/30">
                {accessLevelOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[12px]">Status</Label>
            <select value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)} className="w-full h-10 rounded-md border border-input px-3 text-[13px] bg-card outline-none hover:border-foreground/20 focus-visible:border-foreground/30">
              <option value="active">Active</option>
              <option value="development">Development</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 pt-1">
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={allowSignup} onChange={(e) => setAllowSignup(e.target.checked)} className="w-4 h-4 rounded border-input accent-primary" /><span className="text-[13px]">Allow signup</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={allowAccessRequests} onChange={(e) => setAllowAccessRequests(e.target.checked)} className="w-4 h-4 rounded border-input accent-primary" /><span className="text-[13px]">Access requests</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={allowAdminRequests} onChange={(e) => setAllowAdminRequests(e.target.checked)} className="w-4 h-4 rounded border-input accent-primary" /><span className="text-[13px]">Admin requests</span></label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <DialogClose><Button variant="outline" type="button">Cancel</Button></DialogClose>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

type SchemaTableData = { table_name: string; columns: { column_name: string; data_type: string; is_nullable: string; column_default: string | null }[] }
type SchemaRelation = { source_table: string; source_column: string; target_table: string; target_column: string }

function generateSQL(slug: string, tables: SchemaTableData[]): string {
  const lines: string[] = [`-- Schema: ${slug}`, `-- Generated at ${new Date().toISOString()}`, '']
  for (const table of tables) {
    lines.push(`CREATE TABLE ${slug}.${table.table_name} (`)
    const colLines = table.columns.map((col, i) => {
      let def = `  ${col.column_name} ${col.data_type}`
      if (col.is_nullable === 'NO') def += ' NOT NULL'
      if (col.column_default) def += ` DEFAULT ${col.column_default}`
      if (i < table.columns.length - 1) def += ','
      return def
    })
    lines.push(...colLines)
    lines.push(');', '')
  }
  return lines.join('\n')
}

function generateMermaid(tables: SchemaTableData[], relations: SchemaRelation[]): string {
  const lines: string[] = ['erDiagram']
  for (const table of tables) {
    lines.push(`    ${table.table_name} {`)
    for (const col of table.columns) {
      const pk = col.column_name === 'id' ? 'PK' : ''
      const fk = relations.some(r => r.source_table === table.table_name && r.source_column === col.column_name) ? 'FK' : ''
      const tag = pk || fk
      lines.push(`        ${col.data_type.replace(/\s/g, '_')} ${col.column_name}${tag ? ` ${tag}` : ''}`)
    }
    lines.push('    }')
  }
  for (const rel of relations) {
    lines.push(`    ${rel.target_table} ||--o{ ${rel.source_table} : "${rel.source_column}"`)
  }
  return lines.join('\n')
}

function DiagramCanvas({ svg, slug, tableCount, onClose }: { svg: string; slug: string; tableCount: number; onClose: () => void }) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const panStart = useRef({ x: 0, y: 0 })

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    setDragging(true)
    dragStart.current = { x: e.clientX, y: e.clientY }
    panStart.current = { ...pan }
  }, [pan])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return
    setPan({
      x: panStart.current.x + (e.clientX - dragStart.current.x),
      y: panStart.current.y + (e.clientY - dragStart.current.y),
    })
  }, [dragging])

  const onMouseUp = useCallback(() => setDragging(false), [])

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    setZoom(z => Math.min(4, Math.max(0.2, z + (e.deltaY > 0 ? -0.1 : 0.1))))
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === '=' || e.key === '+') setZoom(z => Math.min(4, z + 0.15))
      if (e.key === '-') setZoom(z => Math.max(0.2, z - 0.15))
      if (e.key === '0') { setZoom(1); setPan({ x: 0, y: 0 }) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[100] bg-[#fafafa] flex flex-col select-none">
      <div className="flex items-center justify-between border-b bg-white px-4 py-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-muted-foreground" />
          <span className="text-[13px] font-semibold">{slug}</span>
          <span className="text-[11px] text-muted-foreground">{tableCount} tables</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center border rounded-md bg-white">
            <button onClick={() => setZoom(z => Math.max(0.2, z - 0.15))} className="px-2 py-1.5 hover:bg-muted transition-colors rounded-l-md">
              <Minus className="h-3 w-3" />
            </button>
            <span className="text-[11px] font-medium px-2 min-w-[3rem] text-center border-x tabular-nums">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(4, z + 0.15))} className="px-2 py-1.5 hover:bg-muted transition-colors rounded-r-md">
              <PlusIcon className="h-3 w-3" />
            </button>
          </div>
          <Button size="xs" variant="outline" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }) }}>Fit</Button>
          <button onClick={onClose} className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-muted transition-colors ml-1">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div
        ref={canvasRef}
        className={cn('flex-1 overflow-hidden', dragging ? 'cursor-grabbing' : 'cursor-grab')}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onWheel={onWheel}
      >
        <div className="w-full h-full relative" style={{ backgroundImage: 'radial-gradient(circle, #ddd 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
          <div
            style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: 'center center' }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div dangerouslySetInnerHTML={{ __html: svg }} />
          </div>
        </div>
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[11px] text-muted-foreground/40 pointer-events-none">
        Drag to pan · Scroll to zoom · 0 to reset · Esc to close
      </div>
    </div>
  )
}

function ProjectSchema({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false)
  const [tables, setTables] = useState<SchemaTableData[]>([])
  const [relations, setRelations] = useState<SchemaRelation[]>([])
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [copiedSQL, setCopiedSQL] = useState(false)
  const [diagramSvg, setDiagramSvg] = useState<string>('')
  const [fullscreen, setFullscreen] = useState(false)
  const [zoom, setZoom] = useState(100)

  async function loadTables() {
    if (loaded) { setOpen(!open); return }
    setOpen(true)
    setLoading(true)
    try {
      const res = await fetch(`/api/schemas/${slug}/tables`)
      if (res.ok) {
        const json = await res.json()
        setTables(json.data || [])
        setRelations(json.relations || [])
        // Render diagram immediately
        renderDiagram(json.data || [], json.relations || [])
      }
    } catch { /* ignore */ }
    setLoading(false)
    setLoaded(true)
  }

  async function renderDiagram(t: SchemaTableData[], r: SchemaRelation[]) {
    try {
      const mermaid = (await import('mermaid')).default
      mermaid.initialize({ startOnLoad: false, theme: 'neutral', themeVariables: { fontSize: '13px' } })
      const code = generateMermaid(t, r)
      const { svg } = await mermaid.render(`mermaid-${slug}-${Date.now()}`, code)
      setDiagramSvg(svg)
    } catch (err) {
      console.error('Mermaid render error:', err)
    }
  }

  function handleCopySQL() {
    navigator.clipboard.writeText(generateSQL(slug, tables))
    setCopiedSQL(true)
    setTimeout(() => setCopiedSQL(false), 2500)
  }

  return (
    <>
      <Card>
        <button onClick={loadTables} className="w-full text-left">
          <CardContent className="flex items-center justify-between">
            <h3 className="text-[13px] font-semibold flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              Schema
              <span className="text-[11px] font-normal text-muted-foreground">{slug}</span>
            </h3>
            <div className="flex items-center gap-2">
              {loaded && <span className="text-[11px] text-muted-foreground">{tables.length} tables</span>}
              {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </div>
          </CardContent>
        </button>

        {open && (
          <div className="px-5 pb-5 pt-0">
            {loading ? (
              <div className="flex items-center gap-2 text-[12px] text-muted-foreground py-4">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading...
              </div>
            ) : tables.length === 0 ? (
              <p className="text-[12px] text-muted-foreground py-4">No tables found in this schema.</p>
            ) : (
              <>
                {/* ER Diagram — always visible */}
                {diagramSvg && (
                  <div className="bg-muted/30 rounded-md p-4 mb-4 overflow-x-auto relative">
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button size="xs" variant="outline" onClick={() => setFullscreen(true)} className="bg-white">
                        <Maximize2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div dangerouslySetInnerHTML={{ __html: diagramSvg }} className="flex justify-center [&_svg]:max-w-full" />
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-1.5 mb-4">
                  <Button size="xs" variant="outline" onClick={handleCopySQL}>
                    {copiedSQL ? <Check className="h-3 w-3 mr-1 text-emerald-600" /> : <Copy className="h-3 w-3 mr-1" />}
                    {copiedSQL ? 'Copied' : 'Copy SQL'}
                  </Button>
                </div>

                {/* Tables list */}
                <div className="space-y-4">
                  {tables.map((table) => (
                    <SchemaTable key={table.table_name} table={table} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </Card>

      {/* Fullscreen canvas */}
      {fullscreen && diagramSvg && (
        <DiagramCanvas
          svg={diagramSvg}
          slug={slug}
          tableCount={tables.length}
          onClose={() => setFullscreen(false)}
        />
      )}
    </>
  )
}

function SchemaTable({ table }: { table: { table_name: string; columns: { column_name: string; data_type: string; is_nullable: string; column_default: string | null }[] } }) {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 text-[12px] font-medium hover:text-foreground transition-colors w-full text-left py-1">
        <ChevronDown className={cn('h-3 w-3 text-muted-foreground transition-transform', open && 'rotate-180')} />
        <TableIcon className="h-3.5 w-3.5 text-muted-foreground" />
        {table.table_name}
        <span className="text-[11px] text-muted-foreground font-normal">({table.columns.length})</span>
      </button>
      {open && (
        <div className="ml-5 mt-1 bg-muted/50 rounded-md overflow-hidden">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="text-left px-3 py-1.5 font-medium">Column</th>
                <th className="text-left px-3 py-1.5 font-medium">Type</th>
                <th className="text-left px-3 py-1.5 font-medium">Null</th>
                <th className="text-left px-3 py-1.5 font-medium">Default</th>
              </tr>
            </thead>
            <tbody>
              {table.columns.map((col) => (
                <tr key={col.column_name} className="border-b border-border/50 last:border-0">
                  <td className="px-3 py-1 font-mono">{col.column_name}</td>
                  <td className="px-3 py-1 text-muted-foreground">{col.data_type}</td>
                  <td className="px-3 py-1">{col.is_nullable === 'YES' ? <span className="text-muted-foreground">yes</span> : <span className="font-medium">NOT NULL</span>}</td>
                  <td className="px-3 py-1 font-mono text-muted-foreground truncate max-w-[150px]">{col.column_default || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
