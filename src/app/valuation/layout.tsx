import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Estimation Gratuite Bien Immobilier Marrakech",
  description:
    "Estimez gratuitement votre villa, riad ou appartement à Marrakech " +
    "en 2 minutes. Évaluation précise par nos experts. " +
    "Palais Rouge Immo — agence immobilière Marrakech.",
  alternates: { canonical: 'https://palaisrouge.online/valuation' },
  openGraph: {
    title: "Estimation Gratuite Bien Immobilier Marrakech | Palais Rouge Immo",
    description: "Estimez gratuitement votre bien immobilier à Marrakech en 2 minutes.",
    url: 'https://palaisrouge.online/valuation',
    images: [{ url: '/og-home.jpg', width: 1200, height: 630 }],
  },
};

export default function ValuationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
