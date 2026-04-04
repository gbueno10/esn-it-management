import { createClient } from '@/lib/supabase/server'
import { isProjectAdmin } from '@/lib/auth/permissions'
import { PeopleDirectory } from '@/components/volunteer/PeopleDirectory'
import { InviteVolunteer } from '@/components/volunteer/InviteVolunteer'
import { redirect } from 'next/navigation'

export default async function VolunteerPeoplePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const isAdmin = await isProjectAdmin()

  const { data: volunteers } = await supabase
    .from('volunteers')
    .select('id, name, photo_url, status, join_semester, nationality, country, contacts')
    .not('name', 'is', null)
    .order('name')

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">People</h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            Meet your fellow ESN volunteers
          </p>
        </div>
        {isAdmin && <InviteVolunteer />}
      </div>
      <PeopleDirectory volunteers={volunteers || []} />
    </div>
  )
}
