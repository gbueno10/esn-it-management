'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { RoleBadge } from '@/components/ui/role-badges'
import { EmptyState } from '@/components/ui/empty-state'
import { Users, Eye } from 'lucide-react'
import Link from 'next/link'

interface UserRow {
  id: string
  name: string | null
  email: string | null
  role: string
  created_at: string
  project_count: number
}

interface UsersTableProps {
  initialUsers: UserRow[]
  isAdmin: boolean
}

export function UsersTable({ initialUsers, isAdmin }: UsersTableProps) {
  const [users, setUsers] = useState(initialUsers)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')

  const filtered = users.filter((u) => {
    const matchesSearch = !search || (u.name || '').toLowerCase().includes(search.toLowerCase()) || (u.email || '').toLowerCase().includes(search.toLowerCase())
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
      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)))
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 max-w-sm">
          <Input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="text-sm border rounded-lg px-3 py-2 bg-card">
          <option value="all">All roles</option>
          <option value="admin">Admin</option>
          <option value="volunteer">Volunteer</option>
          <option value="student">Student</option>
        </select>
        <span className="text-sm text-muted-foreground self-center">{filtered.length} users</span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No users found"
          description={search ? 'Try another search.' : 'No users registered yet.'}
          icon={<Users className="h-8 w-8" />}
        />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>ESN Role</TableHead>
                <TableHead>Projects</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground flex-shrink-0">
                        {(user.name || user.email || '?')[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{user.name || 'No name'}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email || 'No email'}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {isAdmin ? (
                      <select value={user.role} onChange={(e) => handleRoleChange(user.id, e.target.value)} className="text-xs border rounded-lg px-2 py-1 bg-card">
                        <option value="student">Student</option>
                        <option value="volunteer">Volunteer</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <RoleBadge role={user.role} />
                    )}
                  </TableCell>
                  <TableCell>{user.project_count}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/users/${user.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-3 w-3 mr-1" />
                        Details
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
