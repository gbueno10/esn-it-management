import { createPublicClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/users - List all user profiles with their project access
export async function GET(request: Request) {
  const supabase = await createPublicClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const role = searchParams.get('role')
  const search = searchParams.get('search')

  let query = supabase
    .from('profiles')
    .select('*, user_project_access(*)')
    .order('created_at', { ascending: false })

  if (role) {
    query = query.eq('role', role)
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Add project_count to each user
  const usersWithCount = (data || []).map((profile) => ({
    ...profile,
    project_count: (profile.user_project_access || []).filter(
      (a: { revoked_at: string | null }) => !a.revoked_at
    ).length,
  }))

  return NextResponse.json({ data: usersWithCount })
}
