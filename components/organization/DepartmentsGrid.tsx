'use client'

import { cn } from '@/lib/utils'

interface DepartmentSummary {
  id: string
  name: string
  manager_name: string | null
  member_count: number
  working_groups: { id: string; name: string; sort_order: number }[]
}

interface Membership {
  id: string
  member_id: string
  department_id: string | null
  working_group_id: string | null
  role: string
  members: { name: string } | null
}

const deptColors: Record<string, { bg: string; header: string }> = {
  'Events': { bg: 'bg-orange-50', header: 'bg-orange-400' },
  'Education': { bg: 'bg-blue-50', header: 'bg-blue-400' },
  'Projects': { bg: 'bg-emerald-50', header: 'bg-emerald-400' },
  'Communication': { bg: 'bg-pink-50', header: 'bg-pink-400' },
  'Marketing': { bg: 'bg-purple-50', header: 'bg-purple-400' },
  'Partnerships': { bg: 'bg-amber-50', header: 'bg-amber-400' },
  'IT': { bg: 'bg-cyan-50', header: 'bg-cyan-400' },
  'Human Resources': { bg: 'bg-lime-50', header: 'bg-lime-500' },
  'Training & Teambuildings': { bg: 'bg-fuchsia-50', header: 'bg-fuchsia-400' },
  'Buddy Programme': { bg: 'bg-sky-50', header: 'bg-sky-400' },
}

export function DepartmentsGrid({ departments, memberships }: {
  departments: DepartmentSummary[]
  memberships: Membership[]
}) {
  return (
    <div className="overflow-x-auto pb-8">
      <div className="min-w-[900px] space-y-10">
        {departments.map((dept) => {
          const colors = deptColors[dept.name] || { bg: 'bg-gray-50', header: 'bg-gray-400' }
          const deptMembers = memberships.filter(
            m => m.department_id === dept.id || dept.working_groups.some(wg => wg.id === m.working_group_id)
          )

          return (
            <DepartmentOrgChart
              key={dept.id}
              dept={dept}
              members={deptMembers}
              colors={colors}
            />
          )
        })}
      </div>
    </div>
  )
}

function DepartmentOrgChart({ dept, members, colors }: {
  dept: DepartmentSummary
  members: Membership[]
  colors: { bg: string; header: string }
}) {
  const manager = members.find(m => m.role === 'manager' && m.department_id === dept.id)
  const hasWGs = dept.working_groups.length > 0

  return (
    <div className="flex flex-col items-center">
      {/* Department header */}
      <div className={cn('px-6 py-2 rounded-lg text-white font-semibold text-[14px] shadow-sm', colors.header)}>
        {dept.name}
      </div>

      {/* Connector to manager */}
      <div className="w-px h-5 bg-border" />

      {/* Manager */}
      <div className={cn('rounded-lg border px-4 py-2 text-center shadow-sm', colors.bg)}>
        <p className="text-[10px] font-medium text-muted-foreground">Manager</p>
        <p className="text-[13px] font-semibold">{manager?.members?.name || '-'}</p>
      </div>

      {hasWGs ? (
        <>
          {/* Connector down to horizontal line */}
          <div className="w-px h-5 bg-border" />

          {/* Working groups row */}
          <div className="relative flex justify-center gap-6">
            {/* Horizontal connector line */}
            {dept.working_groups.length > 1 && (
              <div
                className="absolute top-0 h-px bg-border"
                style={{
                  left: `calc(50% - ${(dept.working_groups.length - 1) * 50}%)`,
                  right: `calc(50% - ${(dept.working_groups.length - 1) * 50}%)`,
                }}
              />
            )}

            {dept.working_groups
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((wg) => {
                const wgMembers = members.filter(m => m.working_group_id === wg.id)
                const leader = wgMembers.find(m => m.role === 'team_leader')
                const regular = wgMembers.filter(m => m.role === 'member')

                return (
                  <div key={wg.id} className="flex flex-col items-center min-w-[120px]">
                    {/* Vertical connector from horizontal line */}
                    <div className="w-px h-4 bg-border" />

                    {/* WG name */}
                    <div className={cn('rounded-md border px-3 py-1.5 text-center mb-2 text-[11px] font-semibold shadow-sm w-full', colors.bg)}>
                      {wg.name}
                    </div>

                    {/* Team leader */}
                    {leader && (
                      <>
                        <div className="w-px h-3 bg-border" />
                        <div className="rounded-md border px-2.5 py-1.5 text-center bg-card shadow-sm w-full mb-1.5">
                          <p className="text-[9px] font-medium text-amber-600">Team Leader</p>
                          <p className="text-[11px] font-semibold">{leader.members?.name}</p>
                        </div>
                      </>
                    )}

                    {/* Members */}
                    {regular.length > 0 && (
                      <>
                        <div className="w-px h-3 bg-border" />
                        <div className="space-y-1 w-full">
                          {regular.map((m) => (
                            <div key={m.id} className="rounded-md bg-muted/60 px-2.5 py-1 text-center">
                              <p className="text-[11px] text-muted-foreground truncate">{m.members?.name}</p>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
          </div>
        </>
      ) : (
        <>
          {/* Flat department - just show members below manager */}
          <div className="w-px h-5 bg-border" />
          <div className="flex flex-wrap justify-center gap-1.5 max-w-md">
            {members
              .filter(m => m.role !== 'manager')
              .map((m) => (
                <div key={m.id} className="rounded-md bg-muted/60 px-2.5 py-1 text-center">
                  <p className="text-[11px] text-muted-foreground">{m.members?.name}</p>
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  )
}
