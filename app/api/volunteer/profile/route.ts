import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { volunteerProfileSchema, validateBody } from '@/lib/validations'

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

// PATCH /api/volunteer/profile - Update volunteer profile (upserts if row doesn't exist)
export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const validated = validateBody(volunteerProfileSchema, body)
  if ('error' in validated) {
    return NextResponse.json({ error: validated.error }, { status: 400 })
  }

  const fields: Record<string, unknown> = {
    id: user.id,
    email: user.email,
    updated_at: new Date().toISOString(),
    ...validated.data,
  }

  const { data, error } = await supabase
    .from('volunteers')
    .upsert(fields, { onConflict: 'id' })
    .select()
    .single()

  if (error) {
    console.error('[PATCH /api/volunteer/profile]', error.code, error.message, error.details)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}
