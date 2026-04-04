import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Villas, Riads & Appartements à Vendre Marrakech",
  description:
    "Parcourez + de 200 propriétés de luxe à vendre et à louer à Marrakech. " +
    "Villas Palmeraie, riads médina, appartements Guéliz, Hivernage. " +
    "Palais Rouge Immo — votre agence immobilière de confiance.",
  alternates: { canonical: 'https://palaisrouge.online/properties' },
  openGraph: {
    title: "Propriétés de Luxe à Marrakech | Palais Rouge Immo",
    description:
      "Villas, riads, appartements de prestige à vendre et à louer à Marrakech.",
    url: 'https://palaisrouge.online/properties',
    images: [{ url: '/og-properties.svg', width: 1200, height: 630 }],
  },
};

export default function PropertiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
