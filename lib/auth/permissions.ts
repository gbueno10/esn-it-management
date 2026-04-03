import { createPublicClient } from '@/lib/supabase/server'

const PROJECT_SLUG = process.env.NEXT_PUBLIC_PROJECT_SLUG!

/**
 * Check if the current user is staff (volunteer or admin in ESN)
 */
export async function isStaff(): Promise<boolean> {
  const supabase = await createPublicClient()

  const { data } = await supabase.rpc('is_staff')

  return data === true
}

/**
 * Check if the current user is an ESN admin
 */
export async function isESNAdmin(): Promise<boolean> {
  const supabase = await createPublicClient()

  const { data } = await supabase.rpc('is_esn_admin')

  return data === true
}

/**
 * Check if the current user has access to the current project
 */
export async function hasProjectAccess(): Promise<boolean> {
  const supabase = await createPublicClient()

  const { data } = await supabase.rpc('has_project_access', {
    check_project_slug: PROJECT_SLUG,
  })

  return data === true
}

/**
 * Check if the current user is an admin of the current project
 */
export async function isProjectAdmin(): Promise<boolean> {
  const supabase = await createPublicClient()

  const { data } = await supabase.rpc('is_project_admin', {
    check_project_slug: PROJECT_SLUG,
  })

  return data === true
}

/**
 * Get all projects the current user has access to
 */
export async function getUserProjects() {
  const supabase = await createPublicClient()

  const { data, error } = await supabase.rpc('get_user_projects')

  if (error) {
    console.error('Error fetching user projects:', error)
    return []
  }

  return data || []
}

/**
 * Get the current user's role in ESN (student, volunteer, admin)
 */
export async function getESNRole(): Promise<string | null> {
  const supabase = await createPublicClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return profile?.role || null
}

/**
 * Get the current user's role in the current project (user, admin)
 */
export async function getProjectRole(): Promise<string | null> {
  const supabase = await createPublicClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Check if ESN admin (automatically admin of staff_only projects)
  const isAdmin = await isProjectAdmin()
  if (isAdmin) return 'admin'

  // Check user_project_access
  const { data } = await supabase
    .from('user_project_access')
    .select('role')
    .eq('user_id', user.id)
    .eq('project_slug', PROJECT_SLUG)
    .is('revoked_at', null)
    .single()

  return data?.role || 'user'
}
