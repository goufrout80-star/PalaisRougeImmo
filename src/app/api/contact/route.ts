import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { sendContactNotification } from '@/lib/email'
import { sanitizeString, sanitizeEmail, sanitizePhone, sanitizeUUID } from '@/lib/sanitize'

export async function POST(req: NextRequest) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  try {
    const body = await req.json()
    const name = sanitizeString(body.name, 100)
    const email = sanitizeEmail(body.email)
    const phone = sanitizePhone(body.phone)
    const whatsapp = sanitizePhone(body.whatsapp)
    const message = sanitizeString(body.message, 2000)
    const propertyId = sanitizeUUID(body.propertyId)
    const propertyTitle = sanitizeString(body.propertyTitle, 200)

    if (!name || !message) {
      return NextResponse.json(
        { error: 'Nom et message requis.' },
        { status: 400 }
      )
    }

    const supabase = await createServerClient()

    const { error: dbError } = await supabase
      .from('contact_submissions')
      .insert({
        name,
        email:          email || null,
        phone:          phone || null,
        whatsapp:       whatsapp || null,
        message,
        property_id:    propertyId || null,
        property_title: propertyTitle || null,
        source:         'contact_form',
      })

    if (dbError) {
      console.error('[Contact] Supabase insert error:', dbError)
      return NextResponse.json(
        { error: "Erreur lors de l'enregistrement." },
        { status: 500 }
      )
    }

    const origin = req.headers.get('origin') ?? 'https://palaisrouge.online'
    const propertyUrl = propertyId
      ? `${origin}/properties/${propertyId}`
      : undefined

    // Look up agent email if a property was specified
    let agentEmail: string | undefined
    if (propertyId) {
      const { data: prop } = await supabaseAdmin
        .from('properties')
        .select('agent_id')
        .eq('id', propertyId)
        .single()

      if (prop?.agent_id) {
        const { data: agentUser } = await supabaseAdmin.auth.admin.getUserById(prop.agent_id)
        agentEmail = agentUser?.user?.email ?? undefined
      }
    }

    sendContactNotification({
      name: name!,
      email: email ?? undefined,
      phone: phone ?? undefined,
      whatsapp: whatsapp ?? undefined,
      message: message!,
      propertyTitle: propertyTitle ?? undefined,
      propertyUrl,
      toEmail: agentEmail,
    }).catch((err) => console.error('[Resend] Email error:', err))

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Contact] Unexpected error:', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
