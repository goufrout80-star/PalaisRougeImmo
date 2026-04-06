import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/apiAuth'

function adminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// POST — create property
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, ['admin', 'agent'])
  if (auth.error) return auth.error

  const body = await req.json()
  const sb = adminSupabase()
  const { data, error } = await sb
    .from('properties')
    .insert({ ...body, agent_id: auth.user.id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}

// PATCH — update property
export async function PATCH(req: NextRequest) {
  const auth = await requireAuth(req, ['admin', 'agent'])
  if (auth.error) return auth.error

  const { id, ...updates } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const sb = adminSupabase()

  // Agents can only update their own properties
  if (auth.role === 'agent') {
    const { data: prop } = await sb.from('properties').select('agent_id').eq('id', id).single()
    if (prop?.agent_id !== auth.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  const { data, error } = await sb
    .from('properties')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

// DELETE — delete property
export async function DELETE(req: NextRequest) {
  const auth = await requireAuth(req, ['admin', 'agent'])
  if (auth.error) return auth.error

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const sb = adminSupabase()

  if (auth.role === 'agent') {
    const { data: prop } = await sb.from('properties').select('agent_id').eq('id', id).single()
    if (prop?.agent_id !== auth.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  const { error } = await sb.from('properties').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
