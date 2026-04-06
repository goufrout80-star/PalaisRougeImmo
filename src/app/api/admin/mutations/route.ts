import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/apiAuth'

function adminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const ALLOWED_TABLES = [
  'faq_items',
  'site_settings',
  'contact_submissions',
  'valuation_requests',
  'properties',
] as const

type AllowedTable = (typeof ALLOWED_TABLES)[number]

function isAllowedTable(t: string): t is AllowedTable {
  return ALLOWED_TABLES.includes(t as AllowedTable)
}

// POST — generic admin mutation: { action, table, data, id? }
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, ['admin', 'agent'])
  if (auth.error) return auth.error

  const { action, table, data, id } = await req.json()

  if (!action || !table || !isAllowedTable(table)) {
    return NextResponse.json({ error: 'Invalid action or table' }, { status: 400 })
  }

  const sb = adminSupabase()

  try {
    if (action === 'insert') {
      const { data: result, error } = await sb.from(table).insert(data).select().single()
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json(result, { status: 201 })
    }

    if (action === 'update' && id) {
      const { data: result, error } = await sb.from(table).update(data).eq('id', id).select().single()
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json(result)
    }

    if (action === 'upsert') {
      const { error } = await sb.from(table).upsert(data, { onConflict: 'key' })
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json({ success: true })
    }

    if (action === 'delete' && id) {
      const { error } = await sb.from(table).delete().eq('id', id)
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Server error' }, { status: 500 })
  }
}
