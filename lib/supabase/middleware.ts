import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROJECT_SLUG = process.env.NEXT_PUBLIC_PROJECT_SLUG!

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Create Supabase client for auth (always uses default schema for auth)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Define public routes that don't require authentication
  const publicRoutes = ['/login', '/signup', '/auth', '/forgot-password', '/reset-password', '/api/volunteer/signup', '/api/project-config', '/volunteer/onboarding', '/no-access']
  const isPublicRoute = publicRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )

  // Redirect to login if not authenticated and not on public route
  if (!user && !isPublicRoute && request.nextUrl.pathname !== '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If authenticated, check project access
  if (user && !isPublicRoute) {
    // Check if user has access to this project
    const { data: hasAccess } = await supabase.rpc('has_project_access', {
      check_project_slug: PROJECT_SLUG,
      check_user_id: user.id,
    })

    if (!hasAccess) {
      // User doesn't have access — redirect to no-access page (keep them logged in)
      const url = request.nextUrl.clone()
      url.pathname = '/no-access'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
