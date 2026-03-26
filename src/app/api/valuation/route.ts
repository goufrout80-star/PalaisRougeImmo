import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const supabase = await createClient()
    const { error } = await supabase.from('valuation_requests').insert(body)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
