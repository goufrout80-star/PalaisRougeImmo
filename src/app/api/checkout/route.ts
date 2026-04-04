import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe';
import { isServiceConfigured, env } from '@/lib/env';
import { requireAuth } from '@/lib/apiAuth';

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, ['admin', 'agent', 'any']);
  if (auth.error) return auth.error;

  try {
    if (!isServiceConfigured('stripe') || !env.ENABLE_PAYMENTS) {
      return NextResponse.json({ error: 'Payments not enabled' }, { status: 503 });
    }

    const body = await req.json();
    const { propertyId, propertyTitle, amount, customerEmail } = body;

    if (!propertyId || !propertyTitle || !amount || !customerEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await createCheckoutSession({
      propertyId,
      propertyTitle,
      amount: Math.round(amount * 100), // Convert MAD to centimes
      customerEmail,
      successUrl: `${env.APP_URL}/properties/${propertyId}?payment=success`,
      cancelUrl: `${env.APP_URL}/properties/${propertyId}?payment=cancelled`,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, url: result.url });
  } catch (err) {
    console.error('[API/checkout] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
