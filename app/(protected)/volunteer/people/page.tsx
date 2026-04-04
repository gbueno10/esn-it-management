import { createClient } from '@/lib/supabase/server'
import { PeopleDirectory } from '@/components/volunteer/PeopleDirectory'
import { redirect } from 'next/navigation'

export default async function VolunteerPeoplePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: volunteers } = await supabase
    .from('volunteers')
    .select('id, name, photo_url, status, join_semester, nationality, country, contacts')
    .not('name', 'is', null)
    .order('name')

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">People</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Meet your fellow ESN volunteers
        </p>
      </div>
      <PeopleDirectory volunteers={volunteers || []} />
    </div>
  )
}
