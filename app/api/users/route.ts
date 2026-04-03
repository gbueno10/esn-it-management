import { createPublicClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// GET /api/users - List users with emails from auth + profiles data
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

  // Get profiles
  let query = supabase
    .from('profiles')
    .select('id, name, role, created_at, user_project_access(id, project_slug, role, revoked_at)')
    .order('created_at', { ascending: false })

  if (role) {
    query = query.eq('role', role)
  }

  const { data: profiles, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Get emails from auth.users using service role
  const serviceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  let emailMap: Record<string, string> = {}

  if (serviceKey) {
    const admin = createAdminClient(serviceUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // Fetch all auth users to get emails
    const { data: authData } = await admin.auth.admin.listUsers({ perPage: 1000 })
    if (authData?.users) {
      for (const u of authData.users) {
        if (u.email) emailMap[u.id] = u.email
      }
    }
  }

  // Merge and filter
  const usersWithEmails = (profiles || []).map((p) => ({
    id: p.id,
    name: p.name,
    email: emailMap[p.id] || null,
    role: p.role,
    created_at: p.created_at,
    project_count: (p.user_project_access || []).filter(
      (a: { revoked_at: string | null }) => !a.revoked_at
    ).length,
  }))

  // Apply search filter (on merged data since email comes from auth)
  const filtered = search
    ? usersWithEmails.filter(
        (u) =>
          (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
          (u.email || '').toLowerCase().includes(search.toLowerCase())
      )
    : usersWithEmails

  return NextResponse.json({ data: filtered })
}
