import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Vendre Votre Bien Immobilier à Marrakech",
  description:
    "Confiez la vente de votre villa, riad ou appartement à Marrakech " +
    "à Palais Rouge Immo. Estimation gratuite. Réseau international.",
  alternates: { canonical: 'https://palaisrouge.online/sell' },
  openGraph: {
    title: "Vendre Votre Bien Immobilier à Marrakech | Palais Rouge Immo",
    description: "Estimation gratuite et vente de votre bien immobilier à Marrakech.",
    url: 'https://palaisrouge.online/sell',
    images: [{ url: '/og-home.jpg', width: 1200, height: 630 }],
  },
};

export default function SellLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
