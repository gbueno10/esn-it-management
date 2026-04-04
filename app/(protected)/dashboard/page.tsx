import { createPublicClient } from '@/lib/supabase/server'
import { isProjectAdmin } from '@/lib/auth/permissions'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent } from '@/components/ui/card'
import { AccessRequests } from '@/components/admin/AccessRequests'
import { AccessRequestWithDetails } from '@/types'
import { FolderKanban, Users, Plus, Inbox } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createPublicClient()
  const isAdmin = await isProjectAdmin()

  if (!isAdmin) {
    redirect('/volunteer/profile')
  }

  const admin = createAdminClient()

  const [
    { count: totalProjects },
    { count: activeProjects },
    { count: totalUsers },
  ] = await Promise.all([
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
  ])

  // Fetch pending access requests
  const { data: pendingRequests } = await supabase
    .from('access_requests')
    .select('*, projects:project_slug(name)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  const userIds = [...new Set((pendingRequests || []).map(r => r.user_id))]
  const { data: authUsers } = await admin.auth.admin.listUsers({ perPage: 1000 })
  const emailMap: Record<string, string> = {}
  for (const u of authUsers?.users || []) {
    if (u.email) emailMap[u.id] = u.email
  }

  let volMap: Record<string, { name?: string; photo_url?: string }> = {}
  if (userIds.length > 0) {
    const { data: vols } = await admin
      .from('it_manager.volunteers')
      .select('id, name, photo_url')
      .in('id', userIds)
    for (const v of vols || []) {
      volMap[v.id] = { name: v.name, photo_url: v.photo_url }
    }
  }

  const enrichedRequests: AccessRequestWithDetails[] = (pendingRequests || []).map(r => ({
    ...r,
    user_email: emailMap[r.user_id] || undefined,
    user_name: volMap[r.user_id]?.name || undefined,
    user_photo: volMap[r.user_id]?.photo_url || undefined,
    project_name: (r.projects as { name: string } | null)?.name || r.project_slug,
  }))

  const pendingCount = enrichedRequests.length

  const stats = [
    { label: 'Total Projects', value: totalProjects || 0, icon: FolderKanban, href: '/projects' },
    { label: 'Active Projects', value: activeProjects || 0, icon: FolderKanban, href: '/projects' },
    { label: 'Total Users', value: totalUsers || 0, icon: Users, href: '/users' },
    { label: 'Pending Requests', value: pendingCount, icon: Inbox, href: '#access-requests' },
  ]

  return (
    <div className="animate-fade-in-up">
      <div className="mb-10">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-[13px] text-muted-foreground mt-1">Overview of your ESN ecosystem</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((stat) => {
          const Icon = stat.icon
          const isLink = stat.href.startsWith('/')
          const Comp = isLink ? Link : 'a'
          return (
            <Comp key={stat.label} href={stat.href}>
              <Card className="hover-lift cursor-pointer">
                <CardContent>
                  <Icon className="h-4 w-4 text-muted-foreground mb-3" />
                  <div className="text-2xl font-semibold tracking-tight">{stat.value}</div>
                  <div className="text-[12px] text-muted-foreground mt-0.5">{stat.label}</div>
                </CardContent>
              </Card>
            </Comp>
          )
        })}
      </div>

      {/* Access Requests */}
      {pendingCount > 0 && (
        <div className="mb-10" id="access-requests">
          <div className="flex items-center gap-2.5 mb-4">
            <h2 className="text-[15px] font-semibold">Access Requests</h2>
            <span className="text-[11px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
              {pendingCount}
            </span>
          </div>
          <AccessRequests initialRequests={enrichedRequests} />
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link href="/projects" className="group border rounded-lg p-5 hover:bg-muted/50 transition-colors">
          <Plus className="h-5 w-5 mb-2.5 text-muted-foreground" />
          <span className="font-semibold text-[13px] block">New Project</span>
          <p className="text-[12px] text-muted-foreground mt-0.5">Register a new ESN project</p>
        </Link>
        <Link href="/users" className="group border rounded-lg p-5 hover:bg-muted/50 transition-colors">
          <Users className="h-5 w-5 mb-2.5 text-muted-foreground" />
          <span className="font-semibold text-[13px] block">Manage Users</span>
          <p className="text-[12px] text-muted-foreground mt-0.5">Change user roles and access</p>
        </Link>
      </div>
    </div>
  )
}
