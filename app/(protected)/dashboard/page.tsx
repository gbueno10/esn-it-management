import { createPublicClient } from '@/lib/supabase/server'
import { isProjectAdmin } from '@/lib/auth/permissions'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FolderKanban, Users, Shield, Database, Plus, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createPublicClient()
  const isAdmin = await isProjectAdmin()

  // Redirect non-admins (volunteers) to their profile
  if (!isAdmin) {
    redirect('/volunteer/profile')
  }

  const [
    { count: totalProjects },
    { count: activeProjects },
    { count: totalUsers },
    { count: staffCount },
  ] = await Promise.all([
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).in('role', ['volunteer', 'admin']),
  ])

  const { data: recentProjects } = await supabase
    .from('projects')
    .select('slug, name, access_level, is_active, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: recentUsers } = await supabase
    .from('profiles')
    .select('id, name, email, role, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  const stats = [
    { label: 'Total Projects', value: totalProjects || 0, icon: FolderKanban, href: '/projects', color: 'text-[var(--esn-blue)]' },
    { label: 'Active Projects', value: activeProjects || 0, icon: FolderKanban, href: '/projects', color: 'text-[var(--esn-green)]' },
    { label: 'Total Users', value: totalUsers || 0, icon: Users, href: '/users', color: 'text-[var(--esn-pink)]' },
    { label: 'Staff Members', value: staffCount || 0, icon: Shield, href: '/users', color: 'text-[var(--esn-orange)]' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of ESN Porto ecosystem</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.label} href={stat.href}>
              <Card className="hover:border-primary/30 transition-colors cursor-pointer">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Projects */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base">Recent Projects</CardTitle>
            <Link href="/projects" className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="divide-y">
              {(recentProjects || []).map((project) => (
                <div key={project.slug} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">{project.name}</span>
                    <code className="ml-2 text-xs text-muted-foreground">{project.slug}</code>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${project.is_active ? 'bg-green-500' : 'bg-muted-foreground/50'}`} />
                    <span className="text-xs text-muted-foreground">{project.access_level}</span>
                  </div>
                </div>
              ))}
              {(!recentProjects || recentProjects.length === 0) && (
                <div className="py-8 text-center text-sm text-muted-foreground">No projects yet</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base">Recent Users</CardTitle>
            <Link href="/users" className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="divide-y">
              {(recentUsers || []).map((user) => (
                <Link key={user.id} href={`/users/${user.id}`} className="py-3 flex items-center justify-between hover:bg-muted/50 -mx-2 px-2 rounded-lg transition-colors block">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                      {(user.name || user.email || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <span className="text-sm font-medium">{user.name || 'No name'}</span>
                      <span className="ml-2 text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    user.role === 'admin' ? 'bg-destructive/10 text-destructive' :
                    user.role === 'volunteer' ? 'bg-primary/10 text-primary' :
                    'bg-muted text-muted-foreground'
                  }`}>{user.role}</span>
                </Link>
              ))}
              {(!recentUsers || recentUsers.length === 0) && (
                <div className="py-8 text-center text-sm text-muted-foreground">No users yet</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {isAdmin && (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/projects" className="gradient-primary text-white p-5 rounded-xl hover:opacity-90 transition-opacity">
            <Plus className="h-6 w-6 mb-2 opacity-80" />
            <span className="font-semibold block">New Project</span>
            <p className="text-xs text-white/70 mt-1">Register a new ESN project</p>
          </Link>
          <Link href="/users" className="bg-gradient-to-br from-[var(--esn-pink)] to-[var(--esn-orange)] text-white p-5 rounded-xl hover:opacity-90 transition-opacity">
            <Users className="h-6 w-6 mb-2 opacity-80" />
            <span className="font-semibold block">Manage Permissions</span>
            <p className="text-xs text-white/70 mt-1">Change user roles and access</p>
          </Link>
          <Link href="/schemas" className="bg-gradient-to-br from-[var(--esn-green)] to-emerald-600 text-white p-5 rounded-xl hover:opacity-90 transition-opacity">
            <Database className="h-6 w-6 mb-2 opacity-80" />
            <span className="font-semibold block">View Schemas</span>
            <p className="text-xs text-white/70 mt-1">Explore the database</p>
          </Link>
        </div>
      )}
    </div>
  )
}
