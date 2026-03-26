import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Guide Location Immobilier Marrakech",
  description:
    "Guide complet pour louer une propriété à Marrakech : " +
    "démarches, prix, quartiers et conseils d'experts.",
  alternates: { canonical: 'https://palaisrouge.online/guide/renting' },
  openGraph: {
    title: "Guide Location Immobilier Marrakech | Palais Rouge Immo",
    description: "Tout savoir pour louer une propriété à Marrakech.",
    url: 'https://palaisrouge.online/guide/renting',
    images: [{ url: '/og-home.jpg', width: 1200, height: 630 }],
  },
};

export default function RentingGuideLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
