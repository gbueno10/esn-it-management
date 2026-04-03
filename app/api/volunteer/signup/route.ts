import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST /api/volunteer/signup - Called after auth signup to set role + create volunteer row
export async function POST() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()

  // Set profile role to volunteer (upsert in case profile was created by trigger)
  const { error: profileError } = await admin
    .from('profiles')
    .upsert(
      { id: user.id, role: 'volunteer', email: user.email },
      { onConflict: 'id' }
    )

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  // Create volunteer profile in it_manager schema
  const adminItManager = createAdminClient()
  // Switch to it_manager schema for the volunteers table
  const { createClient: createSupa } = await import('@supabase/supabase-js')
  const itClient = createSupa(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { db: { schema: 'it_manager' }, auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { error: volunteerError } = await itClient
    .from('volunteers')
    .upsert(
      { id: user.id, email: user.email, name: null },
      { onConflict: 'id' }
    )

  if (volunteerError) {
    return NextResponse.json({ error: volunteerError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
