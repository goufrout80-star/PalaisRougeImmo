import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "FAQ Immobilier Marrakech — Questions Fréquentes",
  description:
    "Réponses à toutes vos questions sur l'achat, la vente et " +
    "l'investissement immobilier à Marrakech et au Maroc. " +
    "Guides pratiques par les experts de Palais Rouge Immo.",
  alternates: { canonical: 'https://palaisrouge.online/faq' },
  openGraph: {
    title: "FAQ Immobilier Marrakech | Palais Rouge Immo",
    description: "Questions fréquentes sur l'immobilier à Marrakech.",
    url: 'https://palaisrouge.online/faq',
    images: [{ url: '/og-home.svg', width: 1200, height: 630 }],
  },
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
