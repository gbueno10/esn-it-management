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
  access_level: 'public' | 'staff_only' | 'admin_only' | 'custom'
  allow_signup: boolean
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
  access_level: ProjectAccessLevel
  allow_signup: boolean
}

export interface UpdateProjectInput {
  name?: string
  description?: string
  access_level?: ProjectAccessLevel
  allow_signup?: boolean
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
