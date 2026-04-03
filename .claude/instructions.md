# AI Code Builder Instructions

This document provides context for AI assistants (Claude Code, Cursor, GitHub Copilot, etc.) to understand and work with this project effectively.

## Project Overview

This is a Next.js 15 application using:
- **Supabase** for authentication and database
- **PostgreSQL** with schema isolation (multi-tenant architecture)
- **Tailwind CSS** for styling
- **TypeScript** for type safety

## Architecture

### Multi-Schema Database

This project is part of a multi-project Supabase setup. Key concepts:

1. **Shared auth** - `auth.users` is shared across all projects
2. **Isolated schemas** - Each project has its own PostgreSQL schema
3. **Access control** - `public.projects` and `public.user_project_access` control permissions

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL      # Supabase instance URL
NEXT_PUBLIC_SUPABASE_ANON_KEY # Supabase anonymous key
NEXT_PUBLIC_PROJECT_SLUG      # Project identifier (e.g., 'speed_dating')
NEXT_PUBLIC_PROJECT_NAME      # Display name
NEXT_PUBLIC_SUPABASE_SCHEMA   # Database schema for this project
```

### Key Files

- `lib/supabase/client.ts` - Browser Supabase client (uses project schema)
- `lib/supabase/server.ts` - Server Supabase client (uses project schema)
- `lib/supabase/middleware.ts` - Auth + project access verification
- `lib/auth/permissions.ts` - Permission checking functions
- `middleware.ts` - Next.js middleware entry point

## Database Patterns

### Querying from project schema

```typescript
// This automatically queries from NEXT_PUBLIC_SUPABASE_SCHEMA
const supabase = await createClient()
const { data } = await supabase.from('my_table').select('*')
```

### Querying from public schema (shared tables)

```typescript
// Use createPublicClient for shared tables like profiles, projects
const supabase = await createPublicClient()
const { data } = await supabase.from('profiles').select('*')
```

### RPC Functions

Available functions in the database:

```typescript
// Check if current user is staff (volunteer/admin in ESN)
await supabase.rpc('is_staff')

// Check if current user is ESN admin
await supabase.rpc('is_esn_admin')

// Check project access
await supabase.rpc('has_project_access', { check_project_slug: 'my_project' })

// Check if user is project admin
await supabase.rpc('is_project_admin', { check_project_slug: 'my_project' })

// Get all projects user has access to
await supabase.rpc('get_user_projects')
```

## Common Tasks

### Creating a new page

1. Add file in `app/(protected)/your-page/page.tsx` for protected pages
2. Add file in `app/your-page/page.tsx` for public pages
3. Use `createClient()` for data fetching

### Creating a new table

1. Create table in your project's schema:
```sql
CREATE TABLE my_schema.new_table (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  -- your columns
  created_at timestamptz DEFAULT now()
);

-- ALWAYS enable RLS
ALTER TABLE my_schema.new_table ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own data"
  ON my_schema.new_table FOR SELECT
  USING (auth.uid() = user_id);
```

2. Add TypeScript type in `types/index.ts`

### Checking permissions

```typescript
import { isProjectAdmin, isStaff, hasProjectAccess } from '@/lib/auth/permissions'

// In a Server Component
const isAdmin = await isProjectAdmin()
const isStaffMember = await isStaff()
```

### Protecting a route

Routes under `app/(protected)/` are automatically protected by the layout.
For additional checks:

```typescript
// In a page or layout
const isAdmin = await isProjectAdmin()
if (!isAdmin) {
  redirect('/unauthorized')
}
```

## Code Style Guidelines

- Use TypeScript strict mode
- Prefer Server Components, use 'use client' only when necessary
- Use Tailwind CSS for styling
- Follow Next.js 15 App Router conventions
- Keep components small and focused
- Use `@/` path alias for imports

## File Structure

```
app/
├── (auth)/           # Auth pages (login, signup)
├── (protected)/      # Protected pages (require auth)
├── auth/             # Auth API routes (callback, signout)
├── layout.tsx        # Root layout
└── page.tsx          # Landing page

lib/
├── supabase/         # Supabase client configuration
├── auth/             # Permission helpers
└── utils/            # Utility functions

components/
└── ui/               # Reusable UI components

types/
└── index.ts          # TypeScript type definitions
```

## Troubleshooting

### "Table not found"
- Check `NEXT_PUBLIC_SUPABASE_SCHEMA` matches your schema
- Verify table exists in that schema

### "No access to project"
- Project must be registered in `public.projects`
- User must have appropriate role for the project's `access_level`

### RLS blocking queries
- Ensure RLS policies exist for the table
- Check policy conditions match your use case
- Test with service_role key to bypass (debugging only)
