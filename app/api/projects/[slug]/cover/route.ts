import { createPublicClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isESNAdmin } from '@/lib/auth/permissions'
import { NextResponse } from 'next/server'

const BUCKET = 'project-covers'

// POST /api/projects/[slug]/cover - Upload project cover image
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = await createPublicClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const isAdmin = await isESNAdmin()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'File must be under 5MB' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Ensure bucket exists
  const { data: buckets } = await admin.storage.listBuckets()
  if (!buckets?.find(b => b.id === BUCKET)) {
    await admin.storage.createBucket(BUCKET, { public: true })
  }

  const ext = file.name.split('.').pop() || 'jpg'
  const filePath = `${slug}.${ext}`

  // Delete old cover if exists
  const { data: existing } = await admin.storage.from(BUCKET).list('', { search: slug })
  if (existing?.length) {
    await admin.storage.from(BUCKET).remove(existing.map(f => f.name))
  }

  // Upload
  const arrayBuffer = await file.arrayBuffer()
  const { error: uploadError } = await admin.storage
    .from(BUCKET)
    .upload(filePath, arrayBuffer, { contentType: file.type, upsert: true })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: urlData } = admin.storage.from(BUCKET).getPublicUrl(filePath)
  const image_url = urlData.publicUrl

  // Update project
  const { error: updateError } = await supabase
    .from('projects')
    .update({ image_url, updated_at: new Date().toISOString() })
    .eq('slug', slug)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ image_url })
}
