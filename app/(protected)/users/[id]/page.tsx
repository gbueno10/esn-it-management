import { createPublicClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isProjectAdmin } from '@/lib/auth/permissions'
import { UserDetail } from '@/components/users/UserDetail'
import { Project } from '@/types'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createPublicClient()
  const isAdmin = await isProjectAdmin()

  // Get profile using admin client (bypasses RLS)
  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('id, name, role, created_at')
    .eq('id', id)
    .single()

  if (!profile) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-semibold">User not found</h2>
        <Link href="/users" className="text-sm text-primary hover:underline mt-2 inline-block">
          Back to list
        </Link>
      </div>
    )
  }

  // Get email from auth
  let email: string | null = null
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const admin = createAdminClient()
    const { data } = await admin.auth.admin.getUserById(id)
    email = data?.user?.email || null
  }

  const user = {
    id: profile.id as string,
    name: profile.name as string | null,
    email,
    role: profile.role as 'student' | 'volunteer' | 'admin',
    created_at: profile.created_at as string,
    updated_at: profile.created_at as string,
  }

  // Get access entries using admin client
  const { data: access } = await admin
    .from('user_project_access')
    .select('*, projects:project_slug(name, access_level, is_active)')
    .eq('user_id', id)
    .is('revoked_at', null)
    .order('granted_at', { ascending: false })

  // Get all projects for add access
  const { data: allProjects } = await admin
    .from('projects')
    .select('*')
    .eq('is_active', true)
    .order('name')

  return (
    <div>
      <div className="mb-8">
        <Link href="/users">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">User Details</h1>
      </div>
      <UserDetail
        user={user}
        access={access || []}
        allProjects={(allProjects || []) as Project[]}
        isAdmin={isAdmin}
      />
    </div>
  )
}
