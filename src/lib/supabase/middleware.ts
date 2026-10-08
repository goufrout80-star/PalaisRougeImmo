import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isAdminRoute    = path.startsWith('/admin')
  const isAgentRoute    = path.startsWith('/agent')
  const isDashboardRoute = path.startsWith('/dashboard')
  const isLoginPage     = path === '/login'

  // Not logged in — redirect to login
  if (!user && (isAdminRoute || isAgentRoute || isDashboardRoute)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user) {
    const role = user.app_metadata?.role ?? ''

    // Admin and agent access is still controlled by protected app_metadata roles.
    // Temporary setup phase: password authentication is sufficient (no MFA redirect).

    // Redirect logged-in user away from login page
    if (isLoginPage) {
      const url = request.nextUrl.clone()
      url.pathname = role === 'admin'
        ? '/admin/dashboard'
        : role === 'agent'
        ? '/agent/dashboard'
        : '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
