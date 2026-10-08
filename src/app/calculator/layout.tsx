import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Calculateur Prêt Immobilier Maroc",
  description:
    "Calculez vos mensualités et capacité d'emprunt pour votre " +
    "achat immobilier au Maroc. Outil gratuit et instantané. " +
    "Simulez votre prêt immobilier avec Kamar Immob, Marrakech.",
  alternates: { canonical: 'https://kamarimmob.com/calculator' },
  openGraph: {
    title: "Calculateur Prêt Immobilier Maroc | Kamar Immob",
    description: "Calculez vos mensualités pour votre achat immobilier au Maroc.",
    url: 'https://kamarimmob.com/calculator',
    images: [{ url: '/og-home.svg', width: 1200, height: 630 }],
  },
};

export default function CalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
