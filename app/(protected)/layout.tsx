import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isProjectAdmin } from '@/lib/auth/permissions'
import { Sidebar } from '@/components/Sidebar'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const isAdmin = await isProjectAdmin()

  return (
    <div className="min-h-screen flex">
      <Sidebar userEmail={user.email || ''} isAdmin={isAdmin} />
      <main className="flex-1 lg:ml-0 min-h-screen">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
