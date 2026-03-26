export function RealEstateAgentJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': ['RealEstateAgent', 'LocalBusiness'],
          '@id': 'https://palaisrouge.online/#organization',
          name: 'Palais Rouge Immo',
          alternateName: 'Palais Rouge Immobilier',
          url: 'https://palaisrouge.online',
          logo: {
            '@type': 'ImageObject',
            url: 'https://palaisrouge.online/logo.png',
            width: 200,
            height: 60,
          },
          image: 'https://palaisrouge.online/og-home.jpg',
          description:
            "Agence immobilière de luxe N°1 à Marrakech. " +
            "Spécialisée dans la vente et location de villas, " +
            "riads et appartements de prestige.",
          telephone: process.env.NEXT_PUBLIC_COMPANY_PHONE || '+212524430000',
          email: 'contact@palaisrouge.online',
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'Bd Abdelkrim Al Khattabi',
            addressLocality: 'Marrakech',
            postalCode: '40000',
            addressCountry: 'MA',
          },
          geo: {
            '@type': 'GeoCoordinates',
            latitude: 31.6295,
            longitude: -7.9811,
          },
          areaServed: {
            '@type': 'City',
            name: 'Marrakech',
            sameAs: 'https://www.wikidata.org/wiki/Q101174',
          },
          priceRange: 'MAD MAD MAD',
          openingHoursSpecification: [
            {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
              opens: '09:00',
              closes: '19:00',
            },
          ],
          sameAs: [
            'https://www.instagram.com/palaisrougeimmo',
            'https://www.facebook.com/palaisrougeimmo',
          ],
          hasMap: 'https://maps.google.com/?q=Marrakech',
          currenciesAccepted: 'MAD, EUR, USD',
          availableLanguage: [
            { '@type': 'Language', name: 'French' },
            { '@type': 'Language', name: 'English' },
            { '@type': 'Language', name: 'Arabic' },
          ],
        }),
      }}
    />
  );
}

export function PropertyJsonLd({ property, url }: { property: Record<string, unknown>; url: string }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'RealEstateListing',
          '@id': url,
          name: property.title,
          description: property.description,
          url,
          image: property.images ?? [],
          datePosted: property.created_at,
          offers: {
            '@type': 'Offer',
            price: property.price,
            priceCurrency: (property.currency as string) ?? 'MAD',
            availability:
              property.status === 'AVAILABLE'
                ? 'https://schema.org/InStock'
                : 'https://schema.org/SoldOut',
            seller: {
              '@type': 'RealEstateAgent',
              name: 'Palais Rouge Immo',
              url: 'https://palaisrouge.online',
            },
          },
          address: {
            '@type': 'PostalAddress',
            addressLocality: (property.neighborhood as string) ?? (property.city as string) ?? 'Marrakech',
            addressRegion: 'Marrakech-Safi',
            addressCountry: 'MA',
          },
          numberOfRooms: property.bedrooms,
          numberOfBathroomsTotal: property.bathrooms,
          floorSize: {
            '@type': 'QuantitativeValue',
            value: property.surface_area ?? property.surfaceArea,
            unitCode: 'MTK',
          },
          ...(property.latitude
            ? {
                geo: {
                  '@type': 'GeoCoordinates',
                  latitude: property.latitude,
                  longitude: property.longitude,
                },
              }
            : {}),
        }),
      }}
    />
  );
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: items.map((item, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: item.name,
            item: item.url,
          })),
        }),
      }}
    />
  );
}

export function FaqJsonLd({ faqs }: { faqs: { question: string; answer: string }[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map(({ question, answer }) => ({
            '@type': 'Question',
            name: question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: answer,
            },
          })),
        }),
      }}
    />
  );
}

export function BlogPostJsonLd({ post }: { post: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.excerpt,
          image: post.cover_image,
          datePublished: post.published_at,
          dateModified: (post.updated_at as string) ?? post.published_at,
          author: {
            '@type': 'Organization',
            name: 'Palais Rouge Immo',
            url: 'https://palaisrouge.online',
          },
          publisher: {
            '@type': 'Organization',
            name: 'Palais Rouge Immo',
            logo: {
              '@type': 'ImageObject',
              url: 'https://palaisrouge.online/logo.png',
            },
          },
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://palaisrouge.online/resources/${post.slug}`,
          },
        }),
      }}
    />
  );
}
