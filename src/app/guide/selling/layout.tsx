import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Guide Vente Immobilier Marrakech",
  description:
    "Comment vendre votre bien immobilier à Marrakech : " +
    "estimation gratuite, visibilité maximale et accompagnement complet " +
    "jusqu'à la signature. Guide expert Palais Rouge Immo.",
  alternates: { canonical: 'https://palaisrouge.online/guide/selling' },
  openGraph: {
    title: "Guide Vente Immobilier Marrakech | Palais Rouge Immo",
    description: "Tout savoir pour vendre votre propriété à Marrakech.",
    url: 'https://palaisrouge.online/guide/selling',
    images: [{ url: '/og-home.svg', width: 1200, height: 630 }],
  },
};

export default function SellingGuideLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
