import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isProjectAdmin } from '@/lib/auth/permissions'
import { createAdminClient } from '@/lib/supabase/admin'
import { Sidebar } from '@/components/Sidebar'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const isAdmin = await isProjectAdmin()
  const admin = createAdminClient()
  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()
  const userRole = (profile?.role as string) || 'student'

  return (
    <div className="min-h-screen flex">
      <Sidebar userEmail={user.email || ''} isAdmin={isAdmin} userRole={userRole} />
      <main className="flex-1 min-h-screen bg-white">
        <div className="max-w-5xl mx-auto px-6 py-8 lg:px-10 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  )
}
