import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/apiAuth'

function adminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// POST — create or update blog post
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, ['admin'])
  if (auth.error) return auth.error

  const body = await req.json()
  const sb = adminSupabase()

  if (body.id) {
    const { id, ...updates } = body
    const { data, error } = await sb
      .from('blog_posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data)
  } else {
    const { data, error } = await sb
      .from('blog_posts')
      .insert(body)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data, { status: 201 })
  }
}

// DELETE — delete blog post
export async function DELETE(req: NextRequest) {
  const auth = await requireAuth(req, ['admin'])
  if (auth.error) return auth.error

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const sb = adminSupabase()
  const { error } = await sb.from('blog_posts').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
