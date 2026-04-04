import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST /api/volunteer/signup
// Called after auth signup to set profile role to volunteer + create volunteer row.
export async function POST() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized — no session found' }, { status: 401 })
  }

  // Use admin client to bypass RLS for public.profiles
  const admin = createAdminClient()

  // Upsert profile with volunteer role
  // SECURITY: This endpoint can ONLY set role to 'volunteer'.
  // It never grants admin. Admins are only set via /api/users/[id]/role by existing admins.
  // It also never downgrades — if user is already admin/volunteer, role stays.
  const { data: existingProfile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!existingProfile) {
    await admin.from('profiles').insert({
      id: user.id,
      role: 'volunteer',
      email: user.email,
    })
  } else if (existingProfile.role === 'student') {
    // Only upgrade students → volunteer. Never touch admin/volunteer roles.
    await admin.from('profiles').update({ role: 'volunteer' }).eq('id', user.id)
  }

  // Create volunteer profile in the project schema (it_manager)
  // Uses the normal server client which reads schema from NEXT_PUBLIC_SUPABASE_SCHEMA
  await supabase.from('volunteers').upsert(
    { id: user.id, email: user.email },
    { onConflict: 'id' }
  )

  return NextResponse.json({ success: true })
}
