import { createClient } from '@/lib/supabase/server'
import { createClient as createSupa } from '@supabase/supabase-js'
import { OnboardingWizard } from '@/components/volunteer/OnboardingWizard'
import { redirect } from 'next/navigation'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const itClient = createSupa(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { db: { schema: 'it_manager' }, auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: volunteer } = await itClient
    .from('volunteers')
    .select('name')
    .eq('id', user.id)
    .single()

  // Already onboarded → go to profile
  if (volunteer?.name) {
    redirect('/volunteer/profile')
  }

  // Create row if missing
  if (!volunteer) {
    await itClient.from('volunteers').upsert({ id: user.id, email: user.email })
  }

  return <OnboardingWizard authEmail={user.email || ''} existingName={volunteer?.name} />
}
