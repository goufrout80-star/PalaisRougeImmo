import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  sanitizeString,
  sanitizeEmail,
  sanitizePhone,
  sanitizeNumber,
} from '@/lib/sanitize'

const VALID_PROPERTY_TYPES = [
  'villa', 'riad', 'apartment', 'house',
  'land', 'commercial', 'appartement',
  'maison', 'terrain', 'local commercial',
]

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const name = sanitizeString(body.name, 100)
    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: 'Nom invalide ou manquant.' },
        { status: 400 }
      )
    }

    const validated = {
      name,
      email: sanitizeEmail(body.email),
      phone: sanitizePhone(body.phone),
      property_type: VALID_PROPERTY_TYPES.includes(
        String(body.property_type ?? '').toLowerCase()
      )
        ? sanitizeString(body.property_type, 50)
        : null,
      location: sanitizeString(body.location, 200),
      area_sqm: sanitizeNumber(body.area_sqm),
      message: sanitizeString(body.message, 1000),
      is_read: false,
      created_at: new Date().toISOString(),
    }

    const supabase = await createClient()
    const { error } = await supabase
      .from('valuation_requests')
      .insert(validated)

    if (error) {
      console.error('[Valuation] DB error:', error)
      return NextResponse.json(
        { error: 'Erreur lors de l\'enregistrement.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Valuation] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Erreur serveur.' },
      { status: 500 }
    )
  }
}
