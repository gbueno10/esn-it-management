# ESN Porto IT Management

Internal platform for managing ESN Porto's app ecosystem, volunteers, access control, and project administration.

## Features

| Feature | Description |
|---------|-------------|
| **Project Management** | Register, configure, and monitor all ESN apps |
| **Volunteer Portal** | Profile management, photo upload, people directory |
| **Access Control** | Role-based access with request/approve workflow |
| **Smart Login** | Adapts to project config (signup toggle, no-access page) |
| **Admin Dashboard** | Stats, pending requests, user management |

## Access Levels

| Level | Who can access |
|-------|----------------|
| `public` | Anyone who signs up |
| `staff_only` | ESN volunteers & admins |
| `admin_only` | Only ESN admins |
| `custom` | Manually invited users |

## Volunteer Features

- **Profile** with photo upload, contacts, nationality, status
- **People directory** to browse fellow volunteers
- **My Apps** with project cards, external links, and access requests
- **Request Access / Request Admin** per project (admin-configurable)

## Project Configuration

Each project can toggle:
- `allow_signup` — show/hide signup on login page
- `allow_access_requests` — let users request access
- `allow_admin_requests` — let users request admin role
- `image_url` / `app_url` — cover image and external link

## Tech Stack

- **Framework**: Next.js (React)
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL) with schema isolation
- **Auth**: Supabase Auth (shared across all ESN apps)
- **Language**: TypeScript

## Setup

```bash
npm install
cp .env.example .env  # Fill in Supabase credentials
npm run dev
```

## File Structure

```
app/
├── api/
│   ├── admin/access-requests/  → Approve/reject access requests
│   ├── project-config/         → Public project config (no auth)
│   ├── projects/               → CRUD for projects
│   └── volunteer/              → Profile, avatar, directory, access requests
├── (auth)/                     → Login, no-access pages
├── (protected)/
│   ├── dashboard/              → Admin dashboard with stats & requests
│   ├── projects/               → Project management table
│   ├── users/                  → User management
│   └── volunteer/              → Profile, apps, people directory
lib/
├── supabase/                   → Client, server, admin clients
├── auth/                       → Permission helpers (RPC-based)
components/
├── admin/                      → AccessRequests table
├── projects/                   → ProjectsTable with form dialog
└── volunteer/                  → VolunteerProfile, AppsList, PeopleDirectory
```

## License

Internal ESN Porto use.
