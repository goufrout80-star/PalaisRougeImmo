import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Guide Location Immobilier Marrakech",
  description:
    "Guide complet pour louer une propriété à Marrakech : " +
    "démarches, prix, quartiers et conseils d'experts. " +
    "Villas, riads, appartements — Kamar Immob vous accompagne.",
  alternates: { canonical: 'https://kamarimmob.com/guide/renting' },
  openGraph: {
    title: "Guide Location Immobilier Marrakech | Kamar Immob",
    description: "Tout savoir pour louer une propriété à Marrakech.",
    url: 'https://kamarimmob.com/guide/renting',
    images: [{ url: '/og-home.svg', width: 1200, height: 630 }],
  },
};

export default function RentingGuideLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
