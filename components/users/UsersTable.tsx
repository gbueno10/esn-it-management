'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { RoleBadge } from '@/components/ui/role-badges'
import { EmptyState } from '@/components/ui/empty-state'
import { Users, Eye, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
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

const roleFilters = [
  { value: 'all', label: 'All' },
  { value: 'admin', label: 'Admin', dot: 'bg-red-500' },
  { value: 'volunteer', label: 'Volunteer', dot: 'bg-blue-500' },
  { value: 'student', label: 'Student', dot: 'bg-slate-400' },
]

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
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-1.5">
          {roleFilters.map((rf) => (
            <button
              key={rf.value}
              onClick={() => setRoleFilter(rf.value)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all',
                roleFilter === rf.value
                  ? 'bg-foreground text-background shadow-sm'
                  : 'bg-white text-muted-foreground ring-1 ring-border/60 hover:ring-border hover:text-foreground'
              )}
            >
              <span className="flex items-center gap-1.5">
                {rf.dot && roleFilter !== rf.value && <span className={cn('w-1.5 h-1.5 rounded-full', rf.dot)} />}
                {rf.label}
              </span>
            </button>
          ))}
        </div>
        <span className="text-[12px] text-muted-foreground self-center font-medium">{filtered.length} users</span>
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
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-[11px] font-semibold text-muted-foreground flex-shrink-0">
                        {(user.name || user.email || '?')[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium truncate">{user.name || 'No name'}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{user.email || 'No email'}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {isAdmin ? (
                      <select value={user.role} onChange={(e) => handleRoleChange(user.id, e.target.value)} className="text-[12px] border border-input rounded-md px-2 py-1 bg-card font-medium outline-none hover:border-foreground/20">
                        <option value="student">Student</option>
                        <option value="volunteer">Volunteer</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <RoleBadge role={user.role} />
                    )}
                  </TableCell>
                  <TableCell className="text-[13px]">{user.project_count}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/users/${user.id}`}>
                      <Button variant="ghost" size="sm" className="text-[12px]">
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
