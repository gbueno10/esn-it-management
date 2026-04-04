import { createPublicClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MembersList } from '@/components/organization/MembersList'

export default async function MembersPage() {
  const supabase = await createPublicClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: members } = await supabase
    .from('members')
    .select('*')
    .order('name')

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Members</h1>
        <p className="text-[13px] text-muted-foreground mt-1">
          All ESN Porto members ({members?.length || 0})
        </p>
      </div>
      <MembersList members={members || []} />
    </div>
  )
}
