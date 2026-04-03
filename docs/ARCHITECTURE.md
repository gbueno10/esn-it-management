# Multi-Project Architecture with Isolated PostgreSQL Schemas

## Overview

This architecture allows a single self-hosted Supabase instance to serve **multiple independent projects** with strong isolation via separate PostgreSQL schemas.

## Schema Structure

```
Supabase Self-Hosted Instance
│
├── auth (schema) - SHARED
│   └── users - Single identity across all projects
│
├── public (schema) - ESN App + Shared Resources
│   ├── profiles - ESN user profiles (student/volunteer/admin)
│   ├── projects - Registry of all projects
│   ├── user_project_access - Per-project permissions
│   └── [other ESN App tables]
│
├── speed_dating (schema) - Speed Dating App
│   ├── speed_dating_profiles
│   ├── speed_dating_connections
│   ├── speed_dating_likes
│   ├── speed_dating_settings
│   └── speed_dating_feedbacks
│
├── email_sender (schema) - Email Sender App
│   ├── email_campaigns
│   ├── email_runs
│   ├── email_logs
│   └── eventupp_students
```

## Access Control System

### 1. Project Registration

Each project is registered in `public.projects`:

```sql
SELECT * FROM public.projects;

| slug             | name             | access_level | allow_signup |
|------------------|------------------|--------------|--------------|
| esn_app          | ESN App          | public       | true         |
| speed_dating     | Speed Dating     | public       | true         |
| email_sender     | Email Sender     | staff_only   | false        |
```

### 2. Access Levels

| Level | Description | Who can access |
|-------|-------------|----------------|
| `public` | Open to everyone | Any authenticated user |
| `staff_only` | Staff restricted | Only volunteers/admins from ESN |
| `admin_only` | Admin restricted | Only ESN admins |
| `custom` | Explicit list | Only users in `user_project_access` |

### 3. User Roles

**ESN App (source of truth for staff):**
- `student` - Regular students
- `volunteer` - ESN volunteers (staff)
- `admin` - ESN administrators (super staff)

**Per-Project Roles (in `user_project_access`):**
- `user` - Regular project user
- `admin` - Project administrator

### 4. Permission Logic

```
┌─────────────────────────────────────────────────────────────────┐
│                    ACCESS CHECK FLOW                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. User tries to access project                                │
│                         │                                       │
│                         ▼                                       │
│  2. Check project.access_level                                  │
│         │                                                       │
│         ├── 'public' ────────────► ✅ ALLOW                     │
│         │                                                       │
│         ├── 'staff_only' ────────► Check is_staff()             │
│         │                              │                        │
│         │                              ├── true ──► ✅ ALLOW    │
│         │                              └── false ─► ❌ DENY     │
│         │                                                       │
│         ├── 'admin_only' ────────► Check is_esn_admin()         │
│         │                              │                        │
│         │                              ├── true ──► ✅ ALLOW    │
│         │                              └── false ─► ❌ DENY     │
│         │                                                       │
│         └── 'custom' ────────────► Check user_project_access    │
│                                        │                        │
│                                        ├── found ─► ✅ ALLOW    │
│                                        └── not ───► ❌ DENY     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Database Functions

### Check if user is staff (volunteer or admin)
```sql
SELECT is_staff(); -- Returns boolean
SELECT is_staff('user-uuid-here'); -- Check specific user
```

### Check if user is ESN admin
```sql
SELECT is_esn_admin(); -- Returns boolean
```

### Check project access
```sql
SELECT has_project_access('speed_dating'); -- Returns boolean
SELECT has_project_access('email_sender', 'user-uuid'); -- Check specific user
```

### Check if user is project admin
```sql
SELECT is_project_admin('speed_dating'); -- Returns boolean
```

### Get all projects user has access to
```sql
SELECT * FROM get_user_projects();
-- Returns: project_slug, project_name, access_level, user_role, is_admin
```

## Granting Access

### Grant project access
```sql
INSERT INTO user_project_access (user_id, project_slug, role)
VALUES ('user-uuid', 'speed_dating', 'user');
```

### Grant project admin
```sql
INSERT INTO user_project_access (user_id, project_slug, role)
VALUES ('user-uuid', 'email_sender', 'admin');
```

### Revoke access
```sql
UPDATE user_project_access
SET revoked_at = now()
WHERE user_id = 'user-uuid' AND project_slug = 'speed_dating';
```

## Creating a New Project

### 1. Register the project
```sql
INSERT INTO public.projects (slug, name, description, access_level, allow_signup)
VALUES ('my_new_app', 'My New App', 'Description here', 'staff_only', false);
```

### 2. Create the schema
```sql
CREATE SCHEMA IF NOT EXISTS my_new_app;

-- Grant permissions
GRANT USAGE ON SCHEMA my_new_app TO authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA my_new_app TO authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA my_new_app
  GRANT ALL ON TABLES TO authenticated, service_role;
```

### 3. Create tables in the new schema
```sql
CREATE TABLE my_new_app.some_table (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  -- ... other columns
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE my_new_app.some_table ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own data"
  ON my_new_app.some_table FOR SELECT
  USING (auth.uid() = user_id);
```

### 4. Configure the app
```typescript
// lib/supabase/client.ts
const supabase = createClient(url, key, {
  db: { schema: 'my_new_app' }
})
```

## Security Considerations

1. **RLS is mandatory** - All tables must have Row Level Security enabled
2. **Cross-schema queries** - Policies can reference `public.profiles` for admin checks
3. **Auth is shared** - `auth.users` is the single source of identity
4. **Schema isolation** - Each app only accesses its own schema via `db: { schema }` config
5. **Middleware enforcement** - Access checks happen at middleware level, not just RLS
