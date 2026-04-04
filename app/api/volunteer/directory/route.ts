import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/volunteer/directory - List all volunteers with profiles
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('volunteers')
    .select('id, name, photo_url, status, join_semester, nationality, country, contacts')
    .not('name', 'is', null)
    .order('name')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}
