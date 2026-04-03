'use client'

import { useState } from 'react'
import { ESNProfile, Project, UserProjectAccess } from '@/types'
import { Button } from '@/components/ui/Button'
import { RoleBadge, AccessLevelBadge, ProjectRoleBadge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatRelativeTime } from '@/lib/utils'

interface AccessWithProject extends UserProjectAccess {
  projects: { name: string; access_level: string; is_active: boolean } | null
}

interface UserDetailProps {
  user: ESNProfile
  access: AccessWithProject[]
  allProjects: Project[]
  isAdmin: boolean
}

export function UserDetail({ user, access: initialAccess, allProjects, isAdmin }: UserDetailProps) {
  const [access, setAccess] = useState(initialAccess)
  const [showAddAccess, setShowAddAccess] = useState(false)
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
    if (res.ok) {
      setCurrentRole(newRole as ESNProfile['role'])
    }
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
      // Refetch access list
      const accessRes = await fetch(`/api/users/${user.id}/access`)
      if (accessRes.ok) {
        const { data } = await accessRes.json()
        setAccess(data)
      }
      setShowAddAccess(false)
    }
    setLoading(false)
  }

  async function handleChangeProjectRole(accessId: string, newRole: string) {
    const res = await fetch(`/api/users/${user.id}/access/${accessId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    })
    if (res.ok) {
      setAccess(access.map((a) => (a.id === accessId ? { ...a, role: newRole as UserProjectAccess['role'] } : a)))
    }
  }

  async function handleRevokeAccess(accessId: string) {
    const res = await fetch(`/api/users/${user.id}/access/${accessId}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      setAccess(access.filter((a) => a.id !== accessId))
    }
  }

  return (
    <div className="space-y-8">
      {/* User Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-200 flex items-center justify-center text-xl font-bold text-slate-500">
            {(user.name || user.email || '?')[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-slate-900">
              {user.name || 'Sem nome'}
            </h2>
            <p className="text-sm text-slate-500">{user.email}</p>
            <div className="flex items-center gap-3 mt-3">
              {isAdmin ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">ESN Role:</span>
                  <select
                    value={currentRole}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    disabled={loading}
                    className="text-sm border border-slate-200 rounded-lg px-2 py-1 bg-white"
                  >
                    <option value="student">Student</option>
                    <option value="volunteer">Volunteer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              ) : (
                <RoleBadge role={currentRole} />
              )}
              <span className="text-xs text-slate-400">
                Registado {formatRelativeTime(user.created_at)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Project Access */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Acesso a Projetos</h3>
          {isAdmin && availableProjects.length > 0 && (
            <Button size="sm" onClick={() => setShowAddAccess(true)}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Adicionar acesso
            </Button>
          )}
        </div>

        {access.length === 0 ? (
          <EmptyState
            title="Sem acesso a projetos"
            description="Este utilizador ainda não tem acesso a nenhum projeto."
            icon={
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            }
          />
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left font-medium text-slate-500 px-4 py-3">Projeto</th>
                  <th className="text-left font-medium text-slate-500 px-4 py-3">Acesso</th>
                  <th className="text-left font-medium text-slate-500 px-4 py-3">Role</th>
                  <th className="text-left font-medium text-slate-500 px-4 py-3">Desde</th>
                  {isAdmin && (
                    <th className="text-right font-medium text-slate-500 px-4 py-3">Ações</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {access.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-medium text-slate-900">
                          {a.projects?.name || a.project_slug}
                        </span>
                        <code className="ml-2 text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">
                          {a.project_slug}
                        </code>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {a.projects && <AccessLevelBadge level={a.projects.access_level} />}
                    </td>
                    <td className="px-4 py-3">
                      {isAdmin ? (
                        <select
                          value={a.role}
                          onChange={(e) => handleChangeProjectRole(a.id, e.target.value)}
                          className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <ProjectRoleBadge role={a.role} />
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {formatRelativeTime(a.granted_at)}
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevokeAccess(a.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          Revogar
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Access Modal */}
      <AddAccessModal
        open={showAddAccess}
        onClose={() => setShowAddAccess(false)}
        onSubmit={handleAddAccess}
        projects={availableProjects}
        loading={loading}
      />
    </div>
  )
}

function AddAccessModal({
  open,
  onClose,
  onSubmit,
  projects,
  loading,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (projectSlug: string, role: string) => void
  projects: Project[]
  loading: boolean
}) {
  const [selectedProject, setSelectedProject] = useState('')
  const [role, setRole] = useState('user')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (selectedProject) {
      onSubmit(selectedProject, role)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Adicionar Acesso a Projeto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          id="project"
          label="Projeto"
          placeholder="Selecionar projeto..."
          options={projects.map((p) => ({ value: p.slug, label: `${p.name} (${p.slug})` }))}
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          required
        />
        <Select
          id="role"
          label="Role no Projeto"
          options={[
            { value: 'user', label: 'User' },
            { value: 'admin', label: 'Admin' },
          ]}
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading} disabled={!selectedProject}>
            Adicionar
          </Button>
        </div>
      </form>
    </Modal>
  )
}
