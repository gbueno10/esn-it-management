import { createClient } from '@/lib/supabase/server'
import { isProjectAdmin } from '@/lib/auth/permissions'
import { redirect } from 'next/navigation'
import { VolunteerPublicProfile } from '@/components/volunteer/VolunteerPublicProfile'

interface Props {
  params: Promise<{ id: string }>
}

export default async function VolunteerProfilePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const isAdmin = await isProjectAdmin()

  const { data: volunteer, error } = await supabase
    .from('volunteers')
    .select('id, name, email, phone, photo_url, status, join_semester, birthdate, nationality, country, address, contacts')
    .eq('id', id)
    .single()

  if (error || !volunteer) {
    redirect('/volunteer/people')
  }

  // Strip sensitive fields for non-admins
  if (!isAdmin) {
    volunteer.address = null
    volunteer.email = null
  }

  return <VolunteerPublicProfile volunteer={volunteer} isAdmin={isAdmin} />
}
