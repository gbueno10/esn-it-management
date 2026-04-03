'use client'

import { useState } from 'react'
import { ESNProfile } from '@/types'
import { Button } from '@/components/ui/Button'
import { RoleBadge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/EmptyState'
import Link from 'next/link'

interface UserWithCount extends ESNProfile {
  project_count: number
}

interface UsersTableProps {
  initialUsers: UserWithCount[]
  isAdmin: boolean
}

export function UsersTable({ initialUsers, isAdmin }: UsersTableProps) {
  const [users, setUsers] = useState(initialUsers)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')

  const filtered = users.filter((u) => {
    const matchesSearch =
      !search ||
      (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === 'all' || u.role === roleFilter
    return matchesSearch && matchesRole
  })

  async function handleRoleChange(userId: string, newRole: string) {
    const res = await fetch(`/api/users/${userId}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    })
    if (res.ok) {
      const { data } = await res.json()
      setUsers(users.map((u) => (u.id === userId ? { ...u, ...data } : u)))
    }
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Pesquisar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white"
        >
          <option value="all">Todos os roles</option>
          <option value="admin">Admin</option>
          <option value="volunteer">Volunteer</option>
          <option value="student">Student</option>
        </select>
        <span className="text-sm text-slate-500 self-center">{filtered.length} utilizadores</span>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          title="Nenhum utilizador encontrado"
          description={search ? 'Tenta outra pesquisa.' : 'Ainda não há utilizadores registados.'}
          icon={
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left font-medium text-slate-500 px-4 py-3">Utilizador</th>
                  <th className="text-left font-medium text-slate-500 px-4 py-3">ESN Role</th>
                  <th className="text-left font-medium text-slate-500 px-4 py-3">Projetos</th>
                  <th className="text-right font-medium text-slate-500 px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 flex-shrink-0">
                          {(user.name || user.email || '?')[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 truncate">
                            {user.name || 'Sem nome'}
                          </p>
                          <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {isAdmin ? (
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white"
                        >
                          <option value="student">Student</option>
                          <option value="volunteer">Volunteer</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <RoleBadge role={user.role} />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-slate-600">{user.project_count}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/users/${user.id}`}>
                        <Button variant="ghost" size="sm">
                          Ver detalhes
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
