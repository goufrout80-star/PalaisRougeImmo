import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import PropertyDetailClient from './PropertyDetailClient';

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: property } = await supabase
    .from('properties')
    .select('title, description, listing_type, property_type, neighborhood, city, price, bedrooms, bathrooms, surface_area, images, status, is_published, latitude, longitude')
    .eq('id', id)
    .single();

  if (!property) {
    return {
      title: 'Propriété | Palais Rouge Immo',
      robots: { index: false },
    };
  }

  const listingLabel = property.listing_type === 'BUY' ? 'à vendre' : 'à louer';
  const typeLabel = property.property_type ?? 'Propriété';
  const location = [property.neighborhood, property.city].filter(Boolean).join(', ');
  const title = `${property.title} — ${typeLabel} ${listingLabel} à ${location || 'Marrakech'}`;
  const priceFormatted = property.price
    ? `${Number(property.price).toLocaleString('fr-MA')} MAD`
    : '';
  const description =
    `${typeLabel} ${listingLabel} à ${location || 'Marrakech'}. ` +
    (priceFormatted ? `Prix : ${priceFormatted}. ` : '') +
    (property.bedrooms ? `${property.bedrooms} chambres. ` : '') +
    (property.surface_area ? `${property.surface_area} m². ` : '') +
    (property.description
      ? property.description.slice(0, 120) + '...'
      : "Palais Rouge Immo — agence immobilière de luxe à Marrakech.");
  const image = (property.images as string[] | null)?.[0] ?? 'https://palaisrouge.online/og-default.jpg';
  const url = `https://palaisrouge.online/properties/${id}`;
  const shouldIndex = property.status === 'AVAILABLE' && property.is_published;

  return {
    title,
    description,
    robots: shouldIndex ? { index: true, follow: true } : { index: false, follow: false },
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      siteName: 'Palais Rouge Immo',
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export default function PropertyDetailPage() {
  return <PropertyDetailClient />;
}