import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/apiAuth'

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req, ['admin'])
  if (auth.error) return auth.error

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase.auth.admin.listUsers()
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const agents = (data.users ?? [])
    .filter(u => u.user_metadata?.role === 'agent')
    .map(u => ({
      id: u.id,
      name: u.user_metadata?.name ?? u.user_metadata?.full_name ?? u.email ?? 'Agent',
      email: u.email ?? '',
    }))

  return NextResponse.json({ agents })
}
