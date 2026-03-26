import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Blog Immobilier Marrakech — Conseils & Tendances 2026",
  description:
    "Conseils d'experts, guides d'achat, fiscalité, tendances luxe : " +
    "tout sur l'immobilier à Marrakech et au Maroc en 2026.",
  alternates: { canonical: 'https://palaisrouge.online/resources' },
  openGraph: {
    title: "Blog Immobilier Marrakech 2026 | Palais Rouge Immo",
    description: "Conseils experts et tendances immobilières à Marrakech.",
    url: 'https://palaisrouge.online/resources',
    images: [{ url: '/og-home.jpg', width: 1200, height: 630 }],
  },
};

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
