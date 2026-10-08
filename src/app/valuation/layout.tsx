import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Estimation Gratuite Bien Immobilier Marrakech",
  description:
    "Estimez gratuitement votre villa, riad ou appartement à Marrakech " +
    "en 2 minutes. Évaluation précise par nos experts. " +
    "Kamar Immob — agence immobilière Marrakech.",
  alternates: { canonical: 'https://kamarimmob.com/valuation' },
  openGraph: {
    title: "Estimation Gratuite Bien Immobilier Marrakech | Kamar Immob",
    description: "Estimez gratuitement votre bien immobilier à Marrakech en 2 minutes.",
    url: 'https://kamarimmob.com/valuation',
    images: [{ url: '/og-home.svg', width: 1200, height: 630 }],
  },
};

export default function ValuationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
