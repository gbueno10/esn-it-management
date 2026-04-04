import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

const PROJECT_SLUG = process.env.NEXT_PUBLIC_PROJECT_SLUG!

// GET /api/project-config — Public project config (no auth required)
export async function GET() {
  const admin = createAdminClient()

  const { data, error } = await admin
    .from('projects')
    .select('name, description, allow_signup, allow_access_requests, access_level')
    .eq('slug', PROJECT_SLUG)
    .single()

  if (error || !data) {
    return NextResponse.json({
      name: process.env.NEXT_PUBLIC_PROJECT_NAME || 'App',
      allow_signup: false,
      allow_access_requests: false,
      access_level: 'staff_only',
    })
  }

  return NextResponse.json(data)
}
