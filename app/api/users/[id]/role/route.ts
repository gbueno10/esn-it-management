import { createPublicClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isESNAdmin } from '@/lib/auth/permissions'

// PATCH /api/users/[id]/role - Update a user's ESN role
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createPublicClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const isAdmin = await isESNAdmin()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
  }

  const body = await request.json()

  if (!body.role || !['student', 'volunteer', 'admin'].includes(body.role)) {
    return NextResponse.json(
      { error: 'Valid role required: student, volunteer, or admin' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({ role: body.role })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  return NextResponse.json({ data })
}
