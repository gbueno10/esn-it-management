import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/volunteer/profile - Get current volunteer's profile
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('volunteers')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

// PATCH /api/volunteer/profile - Update volunteer profile
export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  const allowed = ['name', 'phone', 'photo_url', 'status', 'join_semester', 'birthdate', 'nationality', 'country', 'contacts']
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key]
  }

  const { data, error } = await supabase
    .from('volunteers')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single()

  if (error) {
    console.error('[PATCH /api/volunteer/profile]', error.code, error.message, error.details)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}
