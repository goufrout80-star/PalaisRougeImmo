import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/agent/',
          '/dashboard/',
          '/login',
          '/2fa/',
          '/update-password',
          '/api/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin/',
          '/agent/',
          '/dashboard/',
          '/login',
          '/2fa/',
          '/update-password',
          '/api/',
        ],
      },
    ],
    sitemap: 'https://kamarimmob.com/sitemap.xml',
    host: 'https://kamarimmob.com',
  }
}
