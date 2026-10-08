import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Blog Immobilier Marrakech — Conseils & Tendances 2026",
  description:
    "Conseils d'experts, guides d'achat, fiscalité, tendances luxe : " +
    "tout sur l'immobilier à Marrakech et au Maroc en 2026. " +
    "Articles publiés par Kamar Immob, agence immobilière de prestige.",
  alternates: { canonical: 'https://kamarimmob.com/resources' },
  openGraph: {
    title: "Blog Immobilier Marrakech 2026 | Kamar Immob",
    description: "Conseils experts et tendances immobilières à Marrakech.",
    url: 'https://kamarimmob.com/resources',
    images: [{ url: '/og-home.svg', width: 1200, height: 630 }],
  },
};

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
