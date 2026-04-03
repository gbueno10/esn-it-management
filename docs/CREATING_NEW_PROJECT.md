# Creating a New Project

This guide explains how to create a new standalone app using the shared Supabase infrastructure.

## Prerequisites

- Access to the Supabase instance
- SSH access to the server (for PostgREST config)
- Node.js 18+ installed
- pnpm/npm/yarn installed

## Step 1: Copy the Template

```bash
# From the repository root
cp -r template my-new-app
cd my-new-app
```

## Step 2: Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-instance.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Project Configuration
NEXT_PUBLIC_PROJECT_SLUG=my_new_app
NEXT_PUBLIC_PROJECT_NAME=My New App

# Schema (usually same as project_slug)
NEXT_PUBLIC_SUPABASE_SCHEMA=my_new_app
```

## Step 3: Register the Project in Database

Connect to Supabase and run:

```sql
-- 1. Register the project
INSERT INTO public.projects (slug, name, description, access_level, allow_signup)
VALUES (
  'my_new_app',           -- slug (must match NEXT_PUBLIC_PROJECT_SLUG)
  'My New App',           -- display name
  'Description of my app', -- description
  'staff_only',           -- access_level: 'public', 'staff_only', 'admin_only', 'custom'
  false                   -- allow_signup: can users create accounts directly?
);
```

### Access Level Options

| Level | Use Case | Example |
|-------|----------|---------|
| `public` | Open apps anyone can use | Speed Dating, ESN App |
| `staff_only` | Internal tools for volunteers | Email Sender, Backoffice |
| `admin_only` | Sensitive admin tools | Financial reports |
| `custom` | Invite-only apps | Beta testing |

## Step 4: Create the Database Schema

```sql
-- 2. Create schema
CREATE SCHEMA IF NOT EXISTS my_new_app;

-- 3. Grant permissions to all Supabase roles
GRANT USAGE ON SCHEMA my_new_app TO authenticator, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA my_new_app TO authenticator, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA my_new_app TO authenticator, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA my_new_app
  GRANT ALL ON TABLES TO authenticator, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA my_new_app
  GRANT ALL ON SEQUENCES TO authenticator, anon, authenticated, service_role;
```

> **Important:** You MUST include `authenticator` in the grants. This is the role PostgREST uses to connect to the database.

## Step 5: Expose the Schema in PostgREST (CRITICAL)

PostgREST only serves schemas that are explicitly listed in its config. Without this step, **all API queries to your schema will fail with `PGRST106 Invalid schema`**.

Our Supabase instance uses `PGRST_DB_USE_LEGACY_GUCS=false`, which means PostgREST reads the schema list from the **`authenticator` database role**, NOT from the `PGRST_DB_SCHEMAS` environment variable.

### How to add your schema

SSH into the server and run this SQL on the database:

```bash
ssh -i ~/.ssh/id_rsa_n8n root@72.60.95.145
docker exec supabase-db psql -U supabase_admin -d postgres
```

```sql
-- 1. Check the current exposed schemas
SELECT rolconfig FROM pg_roles WHERE rolname = 'authenticator';
-- You'll see something like: {pgrst.db_schemas=public,storage,...}

-- 2. Add your schema to the list (append it to the existing value)
ALTER ROLE authenticator SET pgrst.db_schemas TO 'public,storage,graphql_public,asset_management,talent_show,merch,it_manager,my_new_app';

-- 3. Tell PostgREST to reload
NOTIFY pgrst, 'reload config';
NOTIFY pgrst, 'reload schema';
```

### Verify it worked

Check the PostgREST logs:

```bash
docker logs supabase-rest --tail 5
```

You should see the Relations count increase. If not, restart PostgREST:

```bash
cd /opt/supabase && docker compose restart rest
```

> **Why does this happen?** With `PGRST_DB_USE_LEGACY_GUCS=false`, PostgREST reads config from the `authenticator` role's `SET` parameters in PostgreSQL, ignoring the `PGRST_DB_SCHEMAS` env var in docker-compose. The `.env` file is misleading — the real source of truth is `ALTER ROLE authenticator SET pgrst.db_schemas`.

## Step 6: Create Your Tables

```sql
-- Example: User profiles for this app
CREATE TABLE my_new_app.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS (REQUIRED!)
ALTER TABLE my_new_app.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view all profiles"
  ON my_new_app.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON my_new_app.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can create own profile"
  ON my_new_app.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
```

## Step 7: Install Dependencies and Run

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

## Step 8: Grant Access to Users (if staff_only or custom)

For `staff_only` apps, volunteers automatically have access. For `custom` or to grant admin:

```sql
-- Grant user access to the project
INSERT INTO public.user_project_access (user_id, project_slug, role)
VALUES ('user-uuid-here', 'my_new_app', 'user');

-- Grant admin access
INSERT INTO public.user_project_access (user_id, project_slug, role)
VALUES ('user-uuid-here', 'my_new_app', 'admin');
```

## Project Structure

```
my-new-app/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx      # Login page
│   │   └── signup/page.tsx     # Signup page (if allow_signup=true)
│   ├── (protected)/
│   │   ├── layout.tsx          # Protected layout (requires auth)
│   │   └── dashboard/page.tsx  # Your app pages
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Landing page
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser client (with schema)
│   │   ├── server.ts           # Server client (with schema)
│   │   └── middleware.ts       # Auth + project access middleware
│   ├── auth/
│   │   └── permissions.ts      # Permission helper functions
│   └── utils/
│       └── index.ts            # Utility functions
├── components/
│   └── ui/                     # UI components
├── types/
│   └── index.ts                # TypeScript types
├── middleware.ts               # Next.js middleware
├── .env.example
├── package.json
└── README.md
```

## Common Patterns

### Checking if user is project admin

```typescript
import { isProjectAdmin } from '@/lib/auth/permissions'

const isAdmin = await isProjectAdmin()
if (isAdmin) {
  // Show admin features
}
```

### Fetching data from the project schema

```typescript
import { createClient } from '@/lib/supabase/server'

const supabase = await createClient()

// Automatically queries from the correct schema
const { data } = await supabase
  .from('profiles')  // my_new_app.profiles
  .select('*')
```

### Creating a profile on first login

```typescript
// app/(protected)/layout.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProtectedLayout({ children }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Check if profile exists
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Create profile if doesn't exist
  if (!profile) {
    await supabase.from('profiles').insert({
      user_id: user.id,
      display_name: user.email?.split('@')[0]
    })
  }

  return <>{children}</>
}
```

## Troubleshooting

### "Invalid schema: my_new_app" (PGRST106)

This is the most common issue. It means PostgREST doesn't know about your schema.

**Root cause:** With `PGRST_DB_USE_LEGACY_GUCS=false`, PostgREST reads schemas from the `authenticator` role config, NOT from the `PGRST_DB_SCHEMAS` env var.

**Fix:**
```sql
-- Check current config
SELECT rolconfig FROM pg_roles WHERE rolname = 'authenticator';

-- Add your schema (keep all existing ones!)
ALTER ROLE authenticator SET pgrst.db_schemas TO 'public,storage,...,my_new_app';

-- Reload
NOTIFY pgrst, 'reload config';
NOTIFY pgrst, 'reload schema';
```

If that doesn't work, restart PostgREST: `docker compose restart rest`

### "No access to project" error
- Check that the project is registered in `public.projects`
- Verify `access_level` matches user's role
- For `staff_only`, user must be volunteer/admin in ESN

### "Table not found" error
- Verify `NEXT_PUBLIC_SUPABASE_SCHEMA` matches your schema name
- Check that the table exists in the correct schema
- Ensure grants were applied to the schema (including `authenticator` role!)

### RLS blocking queries
- Verify RLS policies are created
- Check that policies use correct conditions
- Test with `service_role` key to bypass RLS (debugging only)

### Queries fail silently (return null instead of data)
- This often means the schema isn't exposed in PostgREST (see PGRST106 fix above)
- The Supabase client returns `null` data with an error object — always check for errors:
```typescript
const { data, error } = await supabase.from('table').select('*')
if (error) console.error('Query failed:', error.code, error.message)
```
