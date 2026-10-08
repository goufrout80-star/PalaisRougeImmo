import { NextRequest, NextResponse } from 'next/server';
import { sendNewsletterWelcome } from '@/lib/email';
import { createClient } from '@/lib/supabase/server';
import { sanitizeEmail } from '@/lib/sanitize';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = sanitizeEmail(body.email);

    if (!email) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const supabase = await createClient();
    // Public RLS allows INSERT, not UPSERT (which requires UPDATE).
    const { error } = await supabase.from('newsletter').insert({ email });
    if (error && error.code !== '23505') {
      console.error('[Newsletter] Database insert failed:', error);
      return NextResponse.json({ error: 'Unable to subscribe' }, { status: 500 });
    }

    // Welcome email is optional and must not prevent a successful subscription.
    if (!error) {
      try { await sendNewsletterWelcome(email); }
      catch (mailError) { console.warn('[Newsletter] Welcome email failed:', mailError); }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[API/newsletter] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
