# ESN Porto App Template

A ready-to-use template for building web apps with user authentication and beautiful UI.

## What's This?

This template gives you a **fully working web app** out of the box:

- Login & signup pages
- User dashboard
- Admin features
- Modern, responsive design
- Connected to our shared database

Just customize it for your needs!

## Quick Links

| Guide | For whom | Description |
|-------|----------|-------------|
| [Getting Started](docs/GETTING_STARTED.md) | Everyone | Step-by-step setup guide |
| [Concepts Explained](docs/CONCEPTS.md) | Beginners | What everything means |
| [Creating Projects](docs/CREATING_NEW_PROJECT.md) | Developers | Technical setup guide |
| [Architecture](docs/ARCHITECTURE.md) | Developers | How it all works |

## 5-Minute Setup

```bash
# 1. Clone the template
git clone https://github.com/ESN-Porto/app-template.git my-app
cd my-app

# 2. Install dependencies
npm install

# 3. Configure (copy .env.example to .env and fill in values)
cp .env.example .env

# 4. Run!
npm run dev
```

Open http://localhost:3000 and you're ready to go!

## Features

| Feature | Description |
|---------|-------------|
| **Authentication** | Login, signup, password reset |
| **Access Control** | Public, staff-only, or admin-only apps |
| **Admin Dashboard** | Different UI for admins vs users |
| **Modern Design** | Clean UI with gradients and animations |
| **Database Ready** | Connected to Supabase |
| **TypeScript** | Type-safe code |

## Screenshots

### Login Page
Clean login with signup tabs, icons, and gradient buttons.

### User Dashboard
Welcome banner, quick actions, and user info.

### Admin Dashboard
Stats overview, admin actions, recent activity feed.

## Access Levels

| Level | Who can access |
|-------|----------------|
| `public` | Anyone who signs up |
| `staff_only` | ESN volunteers & admins |
| `admin_only` | Only ESN admins |
| `custom` | Manually invited users |

## Tech Stack

- **Framework**: Next.js 15 (React)
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Language**: TypeScript

## File Structure

```
app/
├── api/           → ⚠️ Server-side routes (secure operations)
├── (auth)/        → Login & signup pages
├── (protected)/   → Dashboard & app pages
lib/
├── supabase/      → Database connection
├── auth/          → Permission helpers
docs/              → Documentation
```

## Security: Use API Routes

**Always use `/app/api/` for sensitive operations:**
- Creating, updating, deleting data
- Admin-only actions
- Anything with secret keys

See [app/api/README.md](app/api/README.md) for examples.

## Need Help?

1. Check the [Getting Started Guide](docs/GETTING_STARTED.md)
2. Read the [Concepts Explained](docs/CONCEPTS.md)
3. Ask in the ESN Porto tech channel
4. Use Claude AI - it knows this codebase!

## License

Internal ESN Porto use.
