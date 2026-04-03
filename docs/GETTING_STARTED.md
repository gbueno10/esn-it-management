# Getting Started Guide

Welcome! This guide will help you set up your first app using this template. No deep technical knowledge required - just follow the steps.

## What is this?

This is a **template** for creating web apps. Think of it like a pre-built house structure - the walls, plumbing, and electricity are already in place. You just need to decorate and make it yours.

**What's included:**
- User login and registration
- User management (admin vs regular users)
- Beautiful, modern design
- Connection to our shared database

## Before You Start

You'll need:
1. **A computer** with macOS, Windows, or Linux
2. **Node.js** installed ([download here](https://nodejs.org/) - choose the LTS version)
3. **A code editor** like [VS Code](https://code.visualstudio.com/) (free)
4. **Access credentials** to our Supabase database (ask your admin)

### How to check if Node.js is installed

Open your terminal (on Mac: search for "Terminal" in Spotlight) and type:

```
node --version
```

If you see a version number like `v18.17.0`, you're good! If not, install Node.js first.

---

## Step 1: Get the Template

### Option A: Download from GitHub

1. Go to the repository page
2. Click the green **"Code"** button
3. Click **"Download ZIP"**
4. Extract the ZIP to a folder on your computer

### Option B: Clone with Git (if you know Git)

```bash
git clone https://github.com/ESN-Porto/app-template.git my-app
cd my-app
```

---

## Step 2: Configure Your App

### 2.1 Create your configuration file

1. Find the file called `.env.example` in the folder
2. Make a copy of it and name it `.env` (just `.env`, nothing else)
3. Open `.env` in your code editor

### 2.2 Fill in the values

Your `.env` file should look like this:

```
# Supabase - Database Connection
NEXT_PUBLIC_SUPABASE_URL=https://supa.esnporto.org/
NEXT_PUBLIC_SUPABASE_ANON_KEY=ask-your-admin-for-this-key

# Your App Info
NEXT_PUBLIC_PROJECT_SLUG=my_app_name
NEXT_PUBLIC_PROJECT_NAME=My App Name
NEXT_PUBLIC_SUPABASE_SCHEMA=my_app_name

# Local Development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**What each line means:**
| Setting | What it does | Example |
|---------|--------------|---------|
| `SUPABASE_URL` | Address of our database | Already filled in |
| `SUPABASE_ANON_KEY` | Password to connect (ask admin) | A long text string |
| `PROJECT_SLUG` | Unique ID for your app (no spaces!) | `speed_dating` |
| `PROJECT_NAME` | Display name for your app | `Speed Dating` |
| `SUPABASE_SCHEMA` | Database area for your app | Same as PROJECT_SLUG |

---

## Step 3: Install Dependencies

Open terminal in your app folder and run:

```bash
npm install
```

This downloads all the code libraries your app needs. It might take a few minutes.

---

## Step 4: Register Your App in the Database

**You need an admin to do this step** (or database access).

Ask them to run this SQL command:

```sql
INSERT INTO public.projects (slug, name, access_level, allow_signup)
VALUES ('my_app_name', 'My App Name', 'public', true);
```

**Access levels explained:**
| Level | Who can access |
|-------|----------------|
| `public` | Anyone who creates an account |
| `staff_only` | Only ESN volunteers and admins |
| `admin_only` | Only ESN admins |

---

## Step 5: Run Your App

In terminal, run:

```bash
npm run dev
```

You should see something like:

```
▲ Next.js 15.1.3
- Local: http://localhost:3000
✓ Ready
```

**Open your browser** and go to `http://localhost:3000`

You should see your app running!

---

## Step 6: Create an Account

1. Click **"Get Started"** on the home page
2. Click the **"Sign Up"** tab
3. Enter your email and a password
4. Click **"Create Account"**
5. You should be redirected to the dashboard

**Congratulations!** Your app is working.

---

## Common Issues & Solutions

### "npm: command not found"

Node.js isn't installed. [Download it here](https://nodejs.org/).

### "ENOENT: no such file or directory"

You're in the wrong folder. Make sure you're inside your app folder:
```bash
cd path/to/my-app
```

### "Module not found"

You forgot to install dependencies. Run:
```bash
npm install
```

### "Invalid login credentials"

- Check your password is correct
- Make sure your app is registered in the database (Step 4)

### "Access Denied" after login

- Your user might not have permission
- Ask an admin to check your access level

### "Cannot connect to database"

- Check your `.env` file has the correct `SUPABASE_URL` and `SUPABASE_ANON_KEY`
- Make sure you saved the `.env` file
- Restart the app (`Ctrl+C` then `npm run dev`)

---

## Next Steps

Once your app is running, you can:

1. **Customize the design** - Edit files in `app/` folder
2. **Add new pages** - Create new folders in `app/(protected)/`
3. **Change the home page** - Edit `app/page.tsx`
4. **Modify the dashboard** - Edit `app/(protected)/dashboard/page.tsx`
5. **Add backend logic** - Create API routes in `app/api/`

### Important: Use API Routes for Security

When you need to **create, update, or delete data**, always use the `app/api/` folder.

Why? Code in `app/api/` runs on the server and is hidden from users. Code in regular pages can be seen by anyone.

See `app/api/README.md` for examples.

### Need Help?

- Ask in the ESN Porto tech channel
- Check the [Architecture Guide](./ARCHITECTURE.md) for technical details
- Use the AI assistant (Claude) - it knows this codebase!

---

## Glossary

| Term | Meaning |
|------|---------|
| **Terminal** | The command line app on your computer |
| **npm** | A tool to install code libraries |
| **Dependencies** | Code libraries your app needs to work |
| **Environment variables** | Settings stored in the `.env` file |
| **Schema** | A separate "area" in the database for your app |
| **RLS** | Row Level Security - rules for who can see what data |
| **Admin** | A user with special permissions to manage everything |
