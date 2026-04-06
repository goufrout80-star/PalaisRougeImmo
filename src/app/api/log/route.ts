import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

function adminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Try to get the current user from session (may be null for visitors)
    let userId: string | null = null
    let userEmail: string | null = null
    let userRole = 'visitor'
    try {
      const supabase = await createServerClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        userId = user.id
        userEmail = user.email ?? null
        userRole = user.user_metadata?.role ?? 'visitor'
      }
    } catch {
      // Visitor — no auth session
    }

    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0] ??
      req.headers.get('x-real-ip') ??
      'unknown'

    const ua = req.headers.get('user-agent') ?? ''
    const isMobile = /mobile|android|iphone|ipad/i.test(ua)
    const isTablet = /tablet|ipad/i.test(ua)
    const deviceType = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop'

    const sb = adminSupabase()
    await sb.from('activity_logs').insert({
      session_id: body.session_id ?? null,
      user_id: userId,
      user_email: userEmail,
      user_role: userRole,
      event_type: body.event_type,
      event_category: body.event_category,
      event_label: body.event_label ?? null,
      page_url: body.page_url ?? null,
      page_title: body.page_title ?? null,
      referrer: body.referrer ?? null,
      details: body.details ?? {},
      user_agent: ua,
      device_type: deviceType,
      ip_address: ip,
      is_error: body.is_error ?? false,
      error_message: body.error_message ?? null,
    })

    return NextResponse.json({ success: true })
  } catch {
    // Never crash the app because of logging
    return NextResponse.json({ success: false })
  }
}
