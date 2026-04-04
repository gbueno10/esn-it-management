import { createPublicClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DepartmentsGrid } from '@/components/organization/DepartmentsGrid'

export default async function DepartmentsPage() {
  const supabase = await createPublicClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get departments with their working groups
  const { data: departments } = await supabase
    .from('departments')
    .select('*, working_groups(*)')
    .eq('type', 'department')
    .order('sort_order')

  // Get memberships with member names
  const { data: memberships } = await supabase
    .from('department_memberships')
    .select('*, members(name), departments(type)')
    .not('departments.type', 'eq', 'statutory_body')

  // Filter out memberships for statutory bodies (they come as null department join)
  const deptMemberships = (memberships || []).filter(m => m.departments?.type === 'department')

  // Build department details
  const departmentsWithDetails = (departments || []).map(dept => {
    const deptMembers = deptMemberships.filter(
      m => m.department_id === dept.id || dept.working_groups?.some((wg: { id: string }) => wg.id === m.working_group_id)
    )
    const manager = deptMembers.find(m => m.role === 'manager')
    const uniqueMemberIds = new Set(deptMembers.map(m => m.member_id))

    return {
      ...dept,
      manager_name: manager?.members?.name || null,
      member_count: uniqueMemberIds.size,
    }
  })

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Departments</h1>
        <p className="text-[13px] text-muted-foreground mt-1">
          ESN Porto department structure 2025/2026
        </p>
      </div>
      <DepartmentsGrid
        departments={departmentsWithDetails}
        memberships={deptMemberships}
      />
    </div>
  )
}
