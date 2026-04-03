'use client'

import { useState } from 'react'
import { Project, CreateProjectInput, UpdateProjectInput } from '@/types'
import { Button } from '@/components/ui/Button'
import { AccessLevelBadge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Input, Textarea } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatRelativeTime } from '@/lib/utils'

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
  const [showCreate, setShowCreate] = useState(false)
  const [editProject, setEditProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<string>('all')

  const filtered = filter === 'all'
    ? projects
    : filter === 'active'
      ? projects.filter((p) => p.is_active)
      : filter === 'inactive'
        ? projects.filter((p) => !p.is_active)
        : projects.filter((p) => p.access_level === filter)

  async function handleCreate(input: CreateProjectInput) {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setProjects([json.data, ...projects])
      setShowCreate(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdate(slug: string, input: UpdateProjectInput) {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/projects/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setProjects(projects.map((p) => (p.slug === slug ? json.data : p)))
      setEditProject(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update project')
    } finally {
      setLoading(false)
    }
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
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white"
          >
            <option value="all">Todos</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
            <option value="public">Public</option>
            <option value="staff_only">Staff Only</option>
            <option value="admin_only">Admin Only</option>
            <option value="custom">Custom</option>
          </select>
          <span className="text-sm text-slate-500">{filtered.length} projetos</span>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowCreate(true)}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Novo Projeto
          </Button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>
      )}

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          title="Nenhum projeto encontrado"
          description="Cria o primeiro projeto para começar."
          icon={
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left font-medium text-slate-500 px-4 py-3">Projeto</th>
                  <th className="text-left font-medium text-slate-500 px-4 py-3">Slug</th>
                  <th className="text-left font-medium text-slate-500 px-4 py-3">Acesso</th>
                  <th className="text-left font-medium text-slate-500 px-4 py-3">Status</th>
                  <th className="text-left font-medium text-slate-500 px-4 py-3">Signup</th>
                  <th className="text-left font-medium text-slate-500 px-4 py-3">Criado</th>
                  {isAdmin && (
                    <th className="text-right font-medium text-slate-500 px-4 py-3">Ações</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((project) => (
                  <tr key={project.slug} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-medium text-slate-900">{project.name}</span>
                        {project.description && (
                          <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">
                            {project.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                        {project.slug}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      <AccessLevelBadge level={project.access_level} />
                    </td>
                    <td className="px-4 py-3">
                      {isAdmin ? (
                        <button
                          onClick={() => handleToggleActive(project)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors ${
                            project.is_active
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${project.is_active ? 'bg-green-500' : 'bg-slate-400'}`} />
                          {project.is_active ? 'Ativo' : 'Inativo'}
                        </button>
                      ) : (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          project.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${project.is_active ? 'bg-green-500' : 'bg-slate-400'}`} />
                          {project.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {project.allow_signup ? 'Sim' : 'Não'}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {formatRelativeTime(project.created_at)}
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditProject(project)}
                        >
                          Editar
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Modal */}
      <ProjectFormModal
        open={showCreate}
        onClose={() => { setShowCreate(false); setError('') }}
        onSubmit={handleCreate}
        loading={loading}
        title="Novo Projeto"
      />

      {/* Edit Modal */}
      {editProject && (
        <ProjectFormModal
          open={true}
          onClose={() => { setEditProject(null); setError('') }}
          onSubmit={(input) => handleUpdate(editProject.slug, input)}
          loading={loading}
          title={`Editar: ${editProject.name}`}
          initial={editProject}
        />
      )}
    </div>
  )
}

function ProjectFormModal({
  open,
  onClose,
  onSubmit,
  loading,
  title,
  initial,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (input: CreateProjectInput & UpdateProjectInput) => void
  loading: boolean
  title: string
  initial?: Project
}) {
  const [slug, setSlug] = useState(initial?.slug || '')
  const [name, setName] = useState(initial?.name || '')
  const [description, setDescription] = useState(initial?.description || '')
  const [accessLevel, setAccessLevel] = useState<string>(initial?.access_level || 'staff_only')
  const [allowSignup, setAllowSignup] = useState(initial?.allow_signup ?? false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({
      slug,
      name,
      description: description || undefined,
      access_level: accessLevel as CreateProjectInput['access_level'],
      allow_signup: allowSignup,
    })
  }

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {!initial && (
          <Input
            id="slug"
            label="Slug"
            placeholder="meu_projeto"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            required
          />
        )}
        <Input
          id="name"
          label="Nome"
          placeholder="Meu Projeto"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Textarea
          id="description"
          label="Descrição"
          placeholder="Descrição do projeto..."
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Select
          id="access_level"
          label="Nível de Acesso"
          options={accessLevelOptions}
          value={accessLevel}
          onChange={(e) => setAccessLevel(e.target.value)}
        />
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={allowSignup}
            onChange={(e) => setAllowSignup(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-[var(--primary)] focus:ring-[var(--primary)]/30"
          />
          <span className="text-sm text-slate-700">Permitir signup</span>
        </label>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            {initial ? 'Guardar' : 'Criar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
