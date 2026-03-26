// Centralized environment variable access with type safety and defaults.
// Client-side vars must be prefixed with NEXT_PUBLIC_.

export const env = {
  // App
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Palais Rouge Immo',
  COMPANY_EMAIL: process.env.NEXT_PUBLIC_COMPANY_EMAIL || 'contact@palaisrouge.online',
  COMPANY_PHONE: process.env.NEXT_PUBLIC_COMPANY_PHONE || '+212524430000',

  // Supabase
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',


  // Email (Resend)
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@palaisrouge.online',
  EMAIL_TO: process.env.EMAIL_TO || 'contact@palaisrouge.online',

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',

  // Google Maps
  GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',

  // Google Analytics
  GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '',

  // Stripe
  STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',

  // Sentry
  SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN || '',

  // Feature flags
  ENABLE_PAYMENTS: process.env.NEXT_PUBLIC_ENABLE_PAYMENTS === 'true',
  ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  ENABLE_MAPS: process.env.NEXT_PUBLIC_ENABLE_MAPS === 'true',
  ENABLE_IMAGE_UPLOAD: process.env.NEXT_PUBLIC_ENABLE_IMAGE_UPLOAD === 'true',
} as const;

/** Returns true if required server-side env vars are present for a given service */
export function isServiceConfigured(service: 'email' | 'database' | 'cloudinary' | 'stripe' | 'maps' | 'analytics' | 'sentry'): boolean {
  switch (service) {
    case 'email': return !!env.RESEND_API_KEY;
    case 'database': return !!env.SUPABASE_URL;
    case 'cloudinary': return !!env.CLOUDINARY_CLOUD_NAME && !!env.CLOUDINARY_API_KEY;
    case 'stripe': return !!env.STRIPE_SECRET_KEY && !!env.STRIPE_PUBLISHABLE_KEY;
    case 'maps': return !!env.GOOGLE_MAPS_API_KEY;
    case 'analytics': return !!env.GA_MEASUREMENT_ID;
    case 'sentry': return !!env.SENTRY_DSN;
    default: return false;
  }
}
