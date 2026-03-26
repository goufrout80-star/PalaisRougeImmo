import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Calculateur Prêt Immobilier Maroc",
  description:
    "Calculez vos mensualités et capacité d'emprunt pour votre " +
    "achat immobilier au Maroc. Outil gratuit et instantané.",
  alternates: { canonical: 'https://palaisrouge.online/calculator' },
  openGraph: {
    title: "Calculateur Prêt Immobilier Maroc | Palais Rouge Immo",
    description: "Calculez vos mensualités pour votre achat immobilier au Maroc.",
    url: 'https://palaisrouge.online/calculator',
    images: [{ url: '/og-home.jpg', width: 1200, height: 630 }],
  },
};

export default function CalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
