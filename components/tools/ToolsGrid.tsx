'use client'

import { useState } from 'react'
import { Tool } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogClose, DialogDescription } from '@/components/ui/dialog'
import {
  Plus, ExternalLink, Wrench, Copy, Check, ChevronDown, ChevronUp,
  Lock, Pencil, Trash2, Loader2, ArrowUpRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface ToolsGridProps {
  tools: Tool[]
  isAdmin: boolean
}

function getToolGradient(name: string) {
  const gradients = [
    'from-slate-600 to-slate-800',
    'from-zinc-600 to-zinc-800',
    'from-stone-600 to-stone-800',
    'from-neutral-600 to-neutral-800',
    'from-gray-600 to-gray-800',
    'from-slate-700 to-zinc-900',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return gradients[Math.abs(hash) % gradients.length]
}

export function ToolsGrid({ tools: initialTools, isAdmin }: ToolsGridProps) {
  const [tools, setTools] = useState(initialTools)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  async function handleCreate(input: Partial<Tool>) {
    const res = await fetch('/api/tools', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    const json = await res.json()
    if (!res.ok) { toast.error(json.error); return false }
    setTools([...tools, json.data])
    toast.success('Tool added!')
    return true
  }

  async function handleUpdate(id: string, input: Partial<Tool>) {
    const res = await fetch(`/api/tools/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    const json = await res.json()
    if (!res.ok) { toast.error(json.error); return false }
    setTools(tools.map(t => t.id === id ? json.data : t))
    toast.success('Tool updated!')
    return true
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/tools/${id}`, { method: 'DELETE' })
    if (!res.ok) { toast.error('Failed to delete'); return }
    setTools(tools.filter(t => t.id !== id))
    toast.success('Tool deleted')
  }

  const activeTools = tools.filter(t => t.status === 'active')
  const inactiveTools = tools.filter(t => t.status === 'inactive')
  const displayTools = isAdmin ? tools : activeTools

  return (
    <div>
      {isAdmin && (
        <div className="flex justify-end mb-4">
          <ToolFormDialog onSubmit={handleCreate} title="Add Tool">
            <Button size="sm">
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Tool
            </Button>
          </ToolFormDialog>
        </div>
      )}

      {displayTools.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Wrench className="h-8 w-8 mx-auto mb-3 opacity-30" />
          <p className="text-[13px]">No tools yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayTools.map((tool) => {
            const isExpanded = expandedId === tool.id
            return (
              <Card key={tool.id} className={cn(tool.status === 'inactive' && 'opacity-50')}>
                {/* Summary row */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : tool.id)}
                  className="w-full text-left"
                >
                  <CardContent className="flex items-center gap-3.5">
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {tool.icon_url ? (
                        <img src={tool.icon_url} alt={tool.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className={cn('w-full h-full bg-gradient-to-br flex items-center justify-center', getToolGradient(tool.name))}>
                          <Wrench className="h-4 w-4 text-white/70" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-[13px] font-semibold truncate">{tool.name}</h4>
                        {tool.requires_login && <Lock className="h-3 w-3 text-muted-foreground flex-shrink-0" />}
                      </div>
                      {tool.description && (
                        <p className="text-[12px] text-muted-foreground mt-0.5 truncate">{tool.description}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {tool.url && (
                        <a href={tool.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                          className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </a>
                      )}
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </CardContent>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-5 pb-4 pt-0 border-t">
                    <div className="pt-4 space-y-4">
                      {/* Notes */}
                      {tool.notes && (
                        <div>
                          <p className="text-[11px] font-medium text-muted-foreground mb-1.5">Notes</p>
                          <div className="text-[13px] text-foreground bg-muted rounded-lg p-3 whitespace-pre-wrap leading-relaxed">
                            {tool.notes}
                          </div>
                        </div>
                      )}

                      {/* Credentials */}
                      {tool.requires_login && (tool.login_username || tool.login_password) && (
                        <div>
                          <p className="text-[11px] font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                            <Lock className="h-3 w-3" /> Shared Login
                          </p>
                          <div className="space-y-2">
                            {tool.login_username && (
                              <CopyField label="Username" value={tool.login_username} />
                            )}
                            {tool.login_password && (
                              <CopyField label="Password" value={tool.login_password} />
                            )}
                          </div>
                        </div>
                      )}

                      {/* URL button */}
                      {tool.url && (
                        <a href={tool.url} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" className="text-[12px]">
                            <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> Open {tool.name}
                          </Button>
                        </a>
                      )}

                      {/* Admin actions */}
                      {isAdmin && (
                        <div className="flex gap-2 pt-2 border-t">
                          <ToolFormDialog onSubmit={(input) => handleUpdate(tool.id, input)} title={`Edit ${tool.name}`} initial={tool}>
                            <Button variant="outline" size="sm" className="text-[12px]">
                              <Pencil className="h-3 w-3 mr-1" /> Edit
                            </Button>
                          </ToolFormDialog>
                          <Button variant="ghost" size="sm" className="text-[12px] text-destructive hover:text-destructive" onClick={() => { if (confirm(`Delete "${tool.name}"?`)) handleDelete(tool.id) }}>
                            <Trash2 className="h-3 w-3 mr-1" /> Delete
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-muted-foreground w-16 flex-shrink-0">{label}</span>
      <div className="flex-1 flex items-center gap-1.5 bg-muted rounded-md px-2.5 py-1.5">
        <code className="text-[12px] font-mono flex-1 truncate select-all">{value}</code>
        <button onClick={handleCopy} className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background transition-colors">
          {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
        </button>
      </div>
    </div>
  )
}

function ToolFormDialog({ onSubmit, title, initial, children }: {
  onSubmit: (input: Partial<Tool>) => Promise<boolean>
  title: string
  initial?: Tool
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(initial?.name || '')
  const [description, setDescription] = useState(initial?.description || '')
  const [url, setUrl] = useState(initial?.url || '')
  const [notes, setNotes] = useState(initial?.notes || '')
  const [requiresLogin, setRequiresLogin] = useState(initial?.requires_login ?? false)
  const [username, setUsername] = useState(initial?.login_username || '')
  const [password, setPassword] = useState(initial?.login_password || '')
  const [status, setStatus] = useState<'active' | 'inactive'>(initial?.status || 'active')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const success = await onSubmit({
      name,
      description: description || null,
      url: url || null,
      notes: notes || null,
      requires_login: requiresLogin,
      login_username: requiresLogin ? (username || null) : null,
      login_password: requiresLogin ? (password || null) : null,
      status: status as 'active' | 'inactive',
    })
    setLoading(false)
    if (success) {
      setOpen(false)
      if (!initial) { setName(''); setDescription(''); setUrl(''); setNotes(''); setRequiresLogin(false); setUsername(''); setPassword('') }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children as React.ReactElement} />
      <DialogContent>
        <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
        <DialogDescription className="text-[13px] text-muted-foreground mb-4">
          {initial ? 'Update this tool.' : 'Add a shared tool or resource.'}
        </DialogDescription>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[12px]">Name</Label>
              <Input placeholder="Canva, Google Drive..." value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px]">URL</Label>
              <Input placeholder="https://..." value={url} onChange={e => setUrl(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[12px]">Description</Label>
            <Input placeholder="Short description..." value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[12px]">Notes</Label>
            <Textarea placeholder="Detailed notes, instructions, tips..." rows={4} value={notes} onChange={e => setNotes(e.target.value)} />
          </div>

          {/* Login section */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={requiresLogin} onChange={e => setRequiresLogin(e.target.checked)} className="w-4 h-4 rounded border-input accent-primary" />
              <span className="text-[13px] flex items-center gap-1"><Lock className="h-3.5 w-3.5" /> Requires shared login</span>
            </label>
            {requiresLogin && (
              <div className="grid grid-cols-2 gap-4 pl-6">
                <div className="space-y-1.5">
                  <Label className="text-[12px]">Username</Label>
                  <Input placeholder="shared@email.com" value={username} onChange={e => setUsername(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px]">Password</Label>
                  <Input type="text" placeholder="password123" value={password} onChange={e => setPassword(e.target.value)} />
                </div>
              </div>
            )}
          </div>

          {initial && (
            <div className="space-y-1.5">
              <Label className="text-[12px]">Status</Label>
              <select value={status} onChange={e => setStatus(e.target.value as 'active' | 'inactive')} className="w-full h-10 rounded-md border px-3 text-[13px] bg-card">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <DialogClose><Button variant="outline" type="button">Cancel</Button></DialogClose>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : initial ? 'Save' : 'Add Tool'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
