import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "FAQ Immobilier Marrakech — Questions Fréquentes",
  description:
    "Réponses à toutes vos questions sur l'achat, la vente et " +
    "l'investissement immobilier à Marrakech et au Maroc. " +
    "Guides pratiques par les experts de Kamar Immob.",
  alternates: { canonical: 'https://kamarimmob.com/faq' },
  openGraph: {
    title: "FAQ Immobilier Marrakech | Kamar Immob",
    description: "Questions fréquentes sur l'immobilier à Marrakech.",
    url: 'https://kamarimmob.com/faq',
    images: [{ url: '/og-home.svg', width: 1200, height: 630 }],
  },
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
