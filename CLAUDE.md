# AI Assistant Instructions

This document provides context for AI code assistants working on this repository.

## Repository Overview

This is a standalone app template using a shared self-hosted Supabase instance with PostgreSQL schema isolation.

## Database Access (Self-hosted Supabase)

The Supabase instance is self-hosted at `https://supa.esnporto.org` on a VPS.

**Opening the tunnel:**
```bash
ssh -i ~/.ssh/id_rsa_n8n -f -N -L 8081:localhost:8081 root@72.60.95.145
```

When a tunnel is open, you can run SQL directly via the pg/query endpoint:

```bash
curl -s -X POST "https://supa.esnporto.org/pg/query" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "YOUR SQL HERE"}'
```

- Tables for this project live in the `it_manager` schema (not `public`)
- Use `it_manager.table_name` in raw SQL queries
- The service role key is in `.env` as `SUPABASE_SERVICE_ROLE_KEY`

## ⚠️ Security First: Use API Routes

**IMPORTANT: Always use `/app/api/` routes for sensitive operations.**

### When to Use API Routes (REQUIRED)
- Database mutations (INSERT, UPDATE, DELETE)
- Admin-only operations
- Operations using service role key
- Sending emails or notifications
- Any external API calls with secrets
- Payment processing

### When Client Components Are OK
- Reading public data (SELECT)
- UI state management
- Form handling (but submit via API)

### Example Pattern

```typescript
// ❌ BAD - Mutation in client component
'use client'
const handleDelete = async () => {
  await supabase.from('items').delete().eq('id', id)  // Insecure!
}

// ✅ GOOD - Mutation via API route
'use client'
const handleDelete = async () => {
  await fetch(`/api/items/${id}`, { method: 'DELETE' })
}

// app/api/items/[id]/route.ts
export async function DELETE(request, { params }) {
  const isAdmin = await isProjectAdmin()
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  // Safe to delete here
}
```

## Key Architecture Decisions

### 1. Schema Isolation

Each project has its own PostgreSQL schema:
- `public` - ESN App (main app) + shared resources
- `speed_dating` - Speed Dating App
- `email_sender` - Email Sender App
- Project schemas are isolated from each other

### 2. Shared Authentication

All projects share `auth.users`. A single user account can have access to multiple projects.

### 3. Access Control System

```sql
public.projects             -- Registry of all projects
public.user_project_access  -- Per-user, per-project permissions
public.profiles             -- ESN roles (student/volunteer/admin)
```

**Access levels:**
- `public` - Any authenticated user
- `staff_only` - Volunteers + admins only
- `admin_only` - Admins only
- `custom` - Explicit user list

### 4. Database Functions

```sql
is_staff()                   -- Is user volunteer/admin?
is_esn_admin()               -- Is user ESN admin?
has_project_access(slug)     -- Can user access project?
is_project_admin(slug)       -- Is user admin of project?
get_user_projects()          -- List accessible projects
```

## Directory Structure

```
/
├── app/
│   ├── api/                 # ⚠️ Server-side routes (USE THIS!)
│   │   └── example/         # Example API route
│   ├── (auth)/              # Login/signup pages
│   └── (protected)/         # Authenticated pages
├── lib/
│   ├── supabase/            # Supabase clients
│   └── auth/                # Permission helpers
├── components/              # React components
├── docs/                    # Documentation
└── types/                   # TypeScript types
```

## Common Operations

### API Route Template

```typescript
// app/api/resource/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isProjectAdmin } from '@/lib/auth/permissions'

export async function POST(request: Request) {
  const supabase = await createClient()

  // 1. Verify authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Check permissions (for mutations)
  const isAdmin = await isProjectAdmin()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // 3. Validate input
  const body = await request.json()
  if (!body.name) {
    return NextResponse.json({ error: 'Name required' }, { status: 400 })
  }

  // 4. Perform operation
  const { data, error } = await supabase.from('table').insert(body).select()

  // 5. Handle errors
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
```

### Query from project schema

```typescript
const supabase = await createClient()  // Uses NEXT_PUBLIC_SUPABASE_SCHEMA
const { data } = await supabase.from('my_table').select('*')
```

### Query from public schema

```typescript
const supabase = await createPublicClient()  // Uses 'public'
const { data } = await supabase.from('profiles').select('*')
```

### Check permissions

```typescript
import { isProjectAdmin, isStaff } from '@/lib/auth/permissions'
const isAdmin = await isProjectAdmin()
```

## Database Conventions

- All tables must have RLS enabled
- Use `auth.uid()` in policies for user checks
- Reference `auth.users(id)` for user foreign keys
- Use `timestamptz` for timestamps
- Default `created_at` to `now()`

## Code Style

- TypeScript strict mode
- Server Components by default
- API routes for all mutations
- Tailwind CSS for styling
- `@/` path alias for imports

## Security Checklist

When reviewing code, verify:
- [ ] Mutations go through `/api/` routes
- [ ] API routes check authentication
- [ ] API routes check permissions for sensitive ops
- [ ] No service role key exposed to client
- [ ] Input is validated before database operations
- [ ] RLS is enabled on all tables
