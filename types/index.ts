// =============================================================================
// DATABASE TYPES
// =============================================================================

/**
 * User profile from ESN App (public.profiles)
 */
export interface ESNProfile {
  id: string
  role: 'student' | 'volunteer' | 'admin'
  name?: string
  email?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

/**
 * Project registration (public.projects)
 */
export interface Project {
  slug: string
  name: string
  description?: string
  image_url?: string
  app_url?: string
  access_level: 'public' | 'staff_only' | 'admin_only' | 'custom'
  allow_signup: boolean
  allow_access_requests: boolean
  allow_admin_requests: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

/**
 * User project access (public.user_project_access)
 */
export interface UserProjectAccess {
  id: string
  user_id: string
  project_slug: string
  role: 'user' | 'admin'
  granted_at: string
  granted_by?: string
  revoked_at?: string
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

// =============================================================================
// COMPONENT PROP TYPES
// =============================================================================

export interface PageProps {
  params: Promise<Record<string, string>>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

// =============================================================================
// IT MANAGER TYPES
// =============================================================================

export type ESNRole = 'student' | 'volunteer' | 'admin'
export type ProjectAccessLevel = 'public' | 'staff_only' | 'admin_only' | 'custom'
export type ProjectRole = 'user' | 'admin'

export interface CreateProjectInput {
  slug: string
  name: string
  description?: string
  image_url?: string
  app_url?: string
  access_level: ProjectAccessLevel
  allow_signup: boolean
  allow_access_requests?: boolean
  allow_admin_requests?: boolean
}

export interface UpdateProjectInput {
  name?: string
  description?: string
  image_url?: string
  app_url?: string
  access_level?: ProjectAccessLevel
  allow_signup?: boolean
  allow_access_requests?: boolean
  allow_admin_requests?: boolean
  is_active?: boolean
}

export interface UserWithAccess extends ESNProfile {
  project_access: UserProjectAccess[]
  project_count: number
}

export interface SchemaInfo {
  schema_name: string
  table_count: number
}

export interface TableInfo {
  table_name: string
  columns: ColumnInfo[]
}

export interface ColumnInfo {
  column_name: string
  data_type: string
  is_nullable: string
  column_default: string | null
}

// =============================================================================
// ACCESS REQUEST TYPES
// =============================================================================

export type AccessRequestStatus = 'pending' | 'approved' | 'rejected'

export interface AccessRequest {
  id: string
  user_id: string
  project_slug: string
  requested_role: 'user' | 'admin'
  status: AccessRequestStatus
  message?: string
  reviewed_by?: string
  reviewed_at?: string
  created_at: string
}

export interface AccessRequestWithDetails extends AccessRequest {
  user_name?: string
  user_email?: string
  user_photo?: string
  project_name?: string
}

// =============================================================================
// VOLUNTEER TYPES
// =============================================================================

export type VolunteerStatus = 'new_member' | 'member' | 'inactive_member' | 'board' | 'alumni' | 'parachute'

export interface Volunteer {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  photo_url: string | null
  status: VolunteerStatus
  join_semester: string | null
  birthdate: string | null
  nationality: string | null
  country: string | null
  contacts: Record<string, string>
  created_at: string
  updated_at: string
}
