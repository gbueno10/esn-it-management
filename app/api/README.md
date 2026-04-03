# API Routes

This folder contains server-side API routes. **Always use API routes for sensitive operations.**

## Why Use API Routes?

| Client Components | API Routes |
|-------------------|------------|
| Code visible to users | Code hidden on server |
| Can be manipulated | Secure and trusted |
| Limited access to secrets | Full access to env vars |

## When to Use API Routes

**Always use `/api` for:**
- Database mutations (create, update, delete)
- Sending emails
- Processing payments
- Admin-only operations
- Anything using `SUPABASE_SERVICE_ROLE_KEY`
- External API calls with secrets

**OK in client components:**
- Reading public data
- UI interactions
- Form state management

## Example Structure

```
app/api/
├── users/
│   ├── route.ts          # GET /api/users, POST /api/users
│   └── [id]/
│       └── route.ts      # GET/PUT/DELETE /api/users/:id
├── admin/
│   └── route.ts          # Admin-only operations
└── webhooks/
    └── route.ts          # External webhooks
```

## Example API Route

```typescript
// app/api/users/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isProjectAdmin } from '@/lib/auth/permissions'

export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase.from('profiles').select('*')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()

  // Check admin permission
  const isAdmin = await isProjectAdmin()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()

  const { data, error } = await supabase
    .from('profiles')
    .insert(body)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
```

## Calling API Routes from Client

```typescript
// In a client component
const response = await fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'John' }),
})

const data = await response.json()
```

## Security Checklist

- [ ] Always verify authentication (`supabase.auth.getUser()`)
- [ ] Check permissions before mutations (`isProjectAdmin()`)
- [ ] Validate input data
- [ ] Never expose service role key to client
- [ ] Use proper HTTP status codes
- [ ] Handle errors gracefully
