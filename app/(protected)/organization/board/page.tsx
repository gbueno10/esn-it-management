import { createPublicClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BoardDisplay } from '@/components/organization/BoardDisplay'

export default async function BoardPage() {
  const supabase = await createPublicClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get statutory body departments
  const { data: bodies } = await supabase
    .from('departments')
    .select('*')
    .eq('type', 'statutory_body')
    .order('sort_order')

  // Get memberships for statutory bodies
  const { data: memberships } = await supabase
    .from('department_memberships')
    .select('*, members(name)')
    .in('department_id', (bodies || []).map(b => b.id))

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Board</h1>
        <p className="text-[13px] text-muted-foreground mt-1">
          Statutory bodies 2025/2026
        </p>
      </div>
      <BoardDisplay
        bodies={bodies || []}
        memberships={memberships || []}
      />
    </div>
  )
}
