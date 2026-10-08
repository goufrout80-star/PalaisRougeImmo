import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Villas, Riads & Appartements à Vendre Marrakech",
  description:
    "Parcourez + de 200 propriétés de luxe à vendre et à louer à Marrakech. " +
    "Villas Palmeraie, riads médina, appartements Guéliz, Hivernage. " +
    "Kamar Immob — votre agence immobilière de confiance.",
  alternates: { canonical: 'https://kamarimmob.com/properties' },
  openGraph: {
    title: "Propriétés de Luxe à Marrakech | Kamar Immob",
    description:
      "Villas, riads, appartements de prestige à vendre et à louer à Marrakech.",
    url: 'https://kamarimmob.com/properties',
    images: [{ url: '/og-properties.svg', width: 1200, height: 630 }],
  },
};

export default function PropertiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
