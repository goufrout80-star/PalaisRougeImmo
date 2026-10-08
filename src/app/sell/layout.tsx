import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Vendre Votre Bien Immobilier à Marrakech",
  description:
    "Confiez la vente de votre villa, riad ou appartement à Marrakech " +
    "à Kamar Immob. Estimation gratuite, réseau international d'acheteurs " +
    "et accompagnement complet jusqu'à la signature.",
  alternates: { canonical: 'https://kamarimmob.com/sell' },
  openGraph: {
    title: "Vendre Votre Bien Immobilier à Marrakech | Kamar Immob",
    description: "Estimation gratuite et vente de votre bien immobilier à Marrakech.",
    url: 'https://kamarimmob.com/sell',
    images: [{ url: '/og-home.svg', width: 1200, height: 630 }],
  },
};

export default function SellLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
