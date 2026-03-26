import Stripe from 'stripe';
import { env, isServiceConfigured } from './env';

let stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (!isServiceConfigured('stripe')) {
    console.warn('[Stripe] Not configured — payments disabled.');
    return null;
  }
  if (!stripe) {
    stripe = new Stripe(env.STRIPE_SECRET_KEY);
  }
  return stripe;
}

/** Create a Stripe Checkout session for a property deposit */
export async function createCheckoutSession(params: {
  propertyId: string;
  propertyTitle: string;
  amount: number; // in MAD centimes
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const client = getStripe();
  if (!client) return { success: false as const, error: 'Stripe not configured' };

  try {
    const session = await client.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'mad',
            product_data: {
              name: `Dépôt — ${params.propertyTitle}`,
              description: `Dépôt de réservation pour la propriété: ${params.propertyTitle}`,
            },
            unit_amount: params.amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: params.customerEmail,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: {
        propertyId: params.propertyId,
      },
    });

    return { success: true as const, sessionId: session.id, url: session.url };
  } catch (err) {
    console.error('[Stripe] Checkout error:', err);
    return { success: false as const, error: 'Failed to create checkout session' };
  }
}
