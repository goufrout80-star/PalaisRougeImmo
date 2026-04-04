import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  const [{ data: properties }, { data: blogs }] = await Promise.all([
    supabase
      .from('properties')
      .select('id, updated_at, status')
      .eq('is_published', true)
      .eq('status', 'available'),
    supabase
      .from('blog_posts')
      .select('slug, updated_at')
      .eq('is_published', true),
  ])

  const staticPages: MetadataRoute.Sitemap = [
    { url: 'https://palaisrouge.online', lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: 'https://palaisrouge.online/properties', lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: 'https://palaisrouge.online/search', lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: 'https://palaisrouge.online/valuation', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://palaisrouge.online/contact', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://palaisrouge.online/resources', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://palaisrouge.online/faq', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: 'https://palaisrouge.online/sell', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: 'https://palaisrouge.online/agents', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: 'https://palaisrouge.online/calculator', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: 'https://palaisrouge.online/guide/renting', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: 'https://palaisrouge.online/guide/selling', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ]

  const propertyPages: MetadataRoute.Sitemap = (properties ?? []).map((p) => ({
    url: `https://palaisrouge.online/properties/${p.id}`,
    lastModified: new Date(p.updated_at ?? new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const blogPages: MetadataRoute.Sitemap = (blogs ?? []).map((b) => ({
    url: `https://palaisrouge.online/resources/${b.slug}`,
    lastModified: new Date(b.updated_at ?? new Date()),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...propertyPages, ...blogPages]
}
