import { createClient } from '@/lib/supabase/server'
import { VolunteerProfile } from '@/components/volunteer/VolunteerProfile'
import { Volunteer } from '@/types'
import { redirect } from 'next/navigation'

export default async function VolunteerProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: volunteer } = await supabase
    .from('volunteers')
    .select('*')
    .eq('id', user.id)
    .single()

  // No volunteer row — create one with minimal data
  if (!volunteer) {
    await supabase.from('volunteers').upsert({ id: user.id, email: user.email })
    const { data: newVolunteer } = await supabase
      .from('volunteers')
      .select('*')
      .eq('id', user.id)
      .single()

    return (
      <VolunteerProfile
        volunteer={(newVolunteer || { id: user.id, email: user.email }) as Volunteer}
        authEmail={user.email || ''}
      />
    )
  }

  return (
    <VolunteerProfile volunteer={volunteer as Volunteer} authEmail={user.email || ''} />
  )
}
