import { createPublicClient } from '@/lib/supabase/server'
import { isProjectAdmin } from '@/lib/auth/permissions'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createPublicClient()
  const isAdmin = await isProjectAdmin()

  // Fetch stats
  const [
    { count: totalProjects },
    { count: activeProjects },
    { count: totalUsers },
    { count: staffCount },
  ] = await Promise.all([
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .in('role', ['volunteer', 'admin']),
  ])

  // Fetch recent projects
  const { data: recentProjects } = await supabase
    .from('projects')
    .select('slug, name, access_level, is_active, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  // Fetch recent users
  const { data: recentUsers } = await supabase
    .from('profiles')
    .select('id, name, email, role, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  const stats = [
    {
      label: 'Total Projetos',
      value: totalProjects || 0,
      color: 'var(--primary)',
      href: '/projects',
    },
    {
      label: 'Projetos Ativos',
      value: activeProjects || 0,
      color: 'var(--accent)',
      href: '/projects',
    },
    {
      label: 'Total Utilizadores',
      value: totalUsers || 0,
      color: 'var(--secondary)',
      href: '/users',
    },
    {
      label: 'Staff',
      value: staffCount || 0,
      color: 'var(--warning)',
      href: '/users',
    },
  ]

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Overview do ecossistema ESN Porto
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white p-5 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors group"
          >
            <div className="text-3xl font-bold" style={{ color: stat.color }}>
              {stat.value}
            </div>
            <div className="text-sm text-slate-500 mt-1 group-hover:text-slate-700 transition-colors">
              {stat.label}
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Projects */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Projetos Recentes</h2>
            <Link href="/projects" className="text-xs text-[var(--primary)] hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {(recentProjects || []).map((project) => (
              <div key={project.slug} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-slate-900">{project.name}</span>
                  <span className="ml-2 text-xs text-slate-400">{project.slug}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${project.is_active ? 'bg-green-500' : 'bg-slate-300'}`} />
                  <span className="text-xs text-slate-400">{project.access_level}</span>
                </div>
              </div>
            ))}
            {(!recentProjects || recentProjects.length === 0) && (
              <div className="px-5 py-8 text-center text-sm text-slate-400">
                Nenhum projeto ainda
              </div>
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Utilizadores Recentes</h2>
            <Link href="/users" className="text-xs text-[var(--primary)] hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {(recentUsers || []).map((user) => (
              <Link
                key={user.id}
                href={`/users/${user.id}`}
                className="px-5 py-3 flex items-center justify-between hover:bg-slate-50/50 transition-colors block"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                    {(user.name || user.email || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-900">
                      {user.name || 'Sem nome'}
                    </span>
                    <span className="ml-2 text-xs text-slate-400">{user.email}</span>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  user.role === 'admin'
                    ? 'bg-red-100 text-red-700'
                    : user.role === 'volunteer'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-slate-100 text-slate-500'
                }`}>
                  {user.role}
                </span>
              </Link>
            ))}
            {(!recentUsers || recentUsers.length === 0) && (
              <div className="px-5 py-8 text-center text-sm text-slate-400">
                Nenhum utilizador ainda
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {isAdmin && (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/projects"
            className="bg-gradient-to-br from-[var(--primary)] to-[var(--dark)] text-white p-5 rounded-xl hover:opacity-90 transition-opacity"
          >
            <svg className="w-6 h-6 mb-2 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
            <span className="font-semibold">Novo Projeto</span>
            <p className="text-xs text-white/70 mt-1">Registar um novo projeto ESN</p>
          </Link>
          <Link
            href="/users"
            className="bg-gradient-to-br from-[var(--secondary)] to-[var(--warning)] text-white p-5 rounded-xl hover:opacity-90 transition-opacity"
          >
            <svg className="w-6 h-6 mb-2 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className="font-semibold">Gerir Permissões</span>
            <p className="text-xs text-white/70 mt-1">Alterar roles e acessos de users</p>
          </Link>
          <Link
            href="/schemas"
            className="bg-gradient-to-br from-[var(--accent)] to-emerald-600 text-white p-5 rounded-xl hover:opacity-90 transition-opacity"
          >
            <svg className="w-6 h-6 mb-2 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
            <span className="font-semibold">Ver Schemas</span>
            <p className="text-xs text-white/70 mt-1">Explorar a base de dados</p>
          </Link>
        </div>
      )}
    </div>
  )
}
