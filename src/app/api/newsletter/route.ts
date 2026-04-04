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
    await supabase
      .from('newsletter')
      .upsert({ email, subscribed_at: new Date().toISOString() }, { onConflict: 'email' });

    await sendNewsletterWelcome(email);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[API/newsletter] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
