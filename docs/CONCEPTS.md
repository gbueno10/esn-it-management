# Key Concepts Explained

This guide explains the main concepts in simple terms. No coding experience needed!

---

## The Big Picture

```
┌─────────────────────────────────────────────────────────────┐
│                        YOUR APP                              │
│  (The website your users see and interact with)              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       SUPABASE                               │
│  (The database that stores all your data)                    │
│                                                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐         │
│  │  Auth   │  │Speed    │  │ Email   │  │  Your   │         │
│  │(logins) │  │Dating   │  │ Sender  │  │  App    │         │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘         │
│               (schemas - separate data areas)                │
└─────────────────────────────────────────────────────────────┘
```

**In simple terms:**
- Your app is like a storefront that users visit
- Supabase is the warehouse where all the data is stored
- Each app gets its own "section" in the warehouse (called a schema)

---

## Users & Authentication

### What is Authentication?

Authentication = Proving who you are (login)

When someone logs in:
1. They enter email + password
2. Supabase checks if it's correct
3. If yes, they get a "pass" (token) to use the app
4. The app remembers them until they log out

### User Roles

| Role | Description | Powers |
|------|-------------|--------|
| **User** | Regular person using the app | Can use basic features |
| **Admin** | Manager of the app | Can see everything, manage users |
| **ESN Volunteer** | Member of ESN Porto | Automatic access to staff tools |
| **ESN Admin** | ESN Porto leader | Admin access to all ESN tools |

---

## Projects & Access Levels

### What is a Project?

A "project" is a registered app in our system. Each project has:
- A **slug** (unique ID): `speed_dating`
- A **name** (display name): `Speed Dating`
- An **access level** (who can use it)

### Access Levels

| Level | Icon | Who can access | Example apps |
|-------|------|----------------|--------------|
| `public` | 🌍 | Anyone who signs up | Speed Dating, Event Registration |
| `staff_only` | 👥 | ESN volunteers & admins | Email Sender, Backoffice |
| `admin_only` | 🔒 | Only ESN admins | Financial tools, Sensitive data |
| `custom` | ✋ | Only invited users | Beta testing, Special projects |

### How Access is Checked

```
User tries to access app
        │
        ▼
   Are they logged in?
        │
   ┌────┴────┐
   │ No      │ Yes
   ▼         ▼
Go to    What's the app's
login    access level?
             │
    ┌────────┼────────┐
    │        │        │
    ▼        ▼        ▼
 public  staff_only  custom
    │        │        │
    ▼        ▼        ▼
 Allow   Is user    Is user on
  ✓      ESN staff? invite list?
             │        │
         ┌───┴───┐  ┌─┴─┐
         │       │  │   │
        Yes     No Yes  No
         │       │  │   │
         ▼       ▼  ▼   ▼
       Allow  Deny Allow Deny
```

---

## The Database (Supabase)

### What is a Schema?

Think of the database like a filing cabinet:
- The **cabinet** = Supabase (all our data)
- Each **drawer** = A schema (one app's data)
- Each **folder** = A table (one type of data)
- Each **paper** = A row (one record)

```
SUPABASE DATABASE
├── auth (drawer)           ← All user logins
│   └── users (folder)      ← List of all users
│
├── public (drawer)         ← Shared stuff
│   ├── projects (folder)   ← List of registered apps
│   └── profiles (folder)   ← ESN user profiles
│
├── speed_dating (drawer)   ← Speed Dating app
│   ├── events (folder)
│   └── matches (folder)
│
└── email_sender (drawer)   ← Email Sender app
    ├── campaigns (folder)
    └── templates (folder)
```

### Why Separate Schemas?

1. **Organization** - Each app's data is clearly separated
2. **Security** - One app can't accidentally see another's data
3. **Independence** - Each app works on its own

---

## Files & Folders

### Main Folders

```
my-app/
├── app/                 ← THE PAGES (what users see)
│   ├── page.tsx         ← Home page
│   ├── (auth)/          ← Login pages
│   └── (protected)/     ← Pages that need login
│
├── lib/                 ← HELPER CODE
│   ├── supabase/        ← Database connection
│   └── auth/            ← Permission checks
│
├── components/          ← REUSABLE PIECES
│   └── ui/              ← Buttons, cards, etc.
│
├── public/              ← STATIC FILES
│   └── images, icons
│
└── docs/                ← DOCUMENTATION
```

### What Each File Type Does

| Extension | What it is | Example |
|-----------|------------|---------|
| `.tsx` | A page or component | `page.tsx`, `button.tsx` |
| `.ts` | Helper code | `permissions.ts` |
| `.css` | Styling | `globals.css` |
| `.env` | Settings | Database keys |
| `.md` | Documentation | This file! |

---

## Common Terms

### Frontend vs Backend

- **Frontend** = What users see and click (the website)
- **Backend** = The server and database (hidden from users)

Our app uses **Next.js** which does both!

### API

API = A way for apps to talk to each other

When you click "Login":
1. The frontend sends your email/password to the API
2. The API checks with the database
3. The API sends back "success" or "error"
4. The frontend shows you the result

### Environment Variables

Settings stored in a `.env` file:

```
NEXT_PUBLIC_PROJECT_NAME=My App
```

Why "NEXT_PUBLIC_"?
- With `NEXT_PUBLIC_` = Visible to users (safe to share)
- Without = Secret (only server can see)

### Middleware

Code that runs BEFORE every page loads:

```
User clicks link → Middleware runs → Page loads
                        │
                  "Are they logged in?"
                  "Do they have access?"
```

If the checks fail, users are redirected to login or an error page.

### API Routes (`/app/api/`)

A special folder for **server-side code** that users can't see.

```
User clicks "Delete" button
        │
        ▼
   Browser calls /api/items/123
        │
        ▼
   Server checks: "Are they allowed to delete?"
        │
   ┌────┴────┐
  Yes       No
   │         │
   ▼         ▼
 Delete   Return error
  item    "Forbidden"
```

**Why use API routes?**
- Code runs on the server (hidden from users)
- Can use secret keys safely
- Can verify permissions before acting

**Rule of thumb:**
- **Reading data** → OK in regular pages
- **Changing data** (create/update/delete) → Always use `/api/`

---

## Security Basics

### Row Level Security (RLS)

Rules that control who can see what data.

Example rules:
- "Users can only see their own profile"
- "Admins can see all profiles"
- "Users can't delete other users' data"

### Why This Matters

Without RLS, anyone could:
- See everyone's private data
- Delete other people's stuff
- Pretend to be someone else

With RLS, the database itself enforces the rules - even if someone tries to hack the app!

---

## Development vs Production

| | Development | Production |
|--|-------------|------------|
| **Where** | Your computer | The internet |
| **URL** | localhost:3000 | myapp.vercel.app |
| **Who can see** | Only you | Everyone |
| **Data** | Test data | Real data |
| **Speed** | Slower (for debugging) | Fast (optimized) |

When you run `npm run dev`, you're in development mode.

When you deploy to Vercel/Netlify, you're in production.

---

## Deployment

Deployment = Making your app available on the internet

### Options

| Platform | Difficulty | Cost | Best for |
|----------|------------|------|----------|
| **Vercel** | Easy ⭐ | Free tier | Most projects |
| **Netlify** | Easy ⭐ | Free tier | Simple sites |
| **Self-hosted** | Hard ⭐⭐⭐ | Server cost | Full control |

### Basic Steps

1. Push your code to GitHub
2. Connect GitHub to Vercel
3. Add your environment variables
4. Click deploy!

Vercel will automatically update when you push new code.

---

## Need More Help?

- **Getting Started Guide** - [GETTING_STARTED.md](./GETTING_STARTED.md)
- **Technical Architecture** - [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Creating New Projects** - [CREATING_NEW_PROJECT.md](./CREATING_NEW_PROJECT.md)
