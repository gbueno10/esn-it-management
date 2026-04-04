import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

const BUCKET = 'avatars'

// POST /api/volunteer/avatar - Upload profile photo
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
  }

  // Validate file size (2MB max)
  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: 'File must be under 2MB' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Ensure bucket exists
  const { data: buckets } = await admin.storage.listBuckets()
  if (!buckets?.find(b => b.id === BUCKET)) {
    await admin.storage.createBucket(BUCKET, { public: true })
  }

  const ext = file.name.split('.').pop() || 'jpg'
  const filePath = `${user.id}.${ext}`

  // Delete old avatar if exists (different extension)
  const { data: existing } = await admin.storage.from(BUCKET).list('', {
    search: user.id,
  })
  if (existing?.length) {
    await admin.storage.from(BUCKET).remove(existing.map(f => f.name))
  }

  // Upload new avatar
  const arrayBuffer = await file.arrayBuffer()
  const { error: uploadError } = await admin.storage
    .from(BUCKET)
    .upload(filePath, arrayBuffer, {
      contentType: file.type,
      upsert: true,
    })

  if (uploadError) {
    console.error('[POST /api/volunteer/avatar]', uploadError)
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  // Get public URL
  const { data: urlData } = admin.storage.from(BUCKET).getPublicUrl(filePath)
  const photo_url = urlData.publicUrl

  // Update volunteer profile with new photo URL
  const { error: updateError } = await supabase
    .from('volunteers')
    .update({ photo_url, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (updateError) {
    console.error('[POST /api/volunteer/avatar] update', updateError)
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ photo_url })
}

// DELETE /api/volunteer/avatar - Remove profile photo
export async function DELETE() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()

  // Remove all files for this user
  const { data: existing } = await admin.storage.from(BUCKET).list('', {
    search: user.id,
  })
  if (existing?.length) {
    await admin.storage.from(BUCKET).remove(existing.map(f => f.name))
  }

  // Clear photo_url in profile
  await supabase
    .from('volunteers')
    .update({ photo_url: null, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  return NextResponse.json({ success: true })
}
