import { createClient } from '@/lib/supabase/server'
import { createClient as createSupa } from '@supabase/supabase-js'
import { VolunteerProfile } from '@/components/volunteer/VolunteerProfile'
import { Volunteer } from '@/types'
import { redirect } from 'next/navigation'

export default async function VolunteerProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get volunteer profile from it_manager schema
  const itClient = createSupa(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { db: { schema: 'it_manager' }, auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: volunteer } = await itClient
    .from('volunteers')
    .select('*')
    .eq('id', user.id)
    .single()

  // If no volunteer profile exists yet, create one
  if (!volunteer) {
    await itClient.from('volunteers').upsert({ id: user.id, email: user.email })
    const { data: newVolunteer } = await itClient
      .from('volunteers')
      .select('*')
      .eq('id', user.id)
      .single()

    return (
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">Complete your volunteer profile</p>
        </div>
        <VolunteerProfile volunteer={(newVolunteer || { id: user.id, contacts: {} }) as Volunteer} authEmail={user.email || ''} />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your volunteer profile</p>
      </div>
      <VolunteerProfile volunteer={volunteer as Volunteer} authEmail={user.email || ''} />
    </div>
  )
}
