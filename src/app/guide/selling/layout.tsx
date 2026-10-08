import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Guide Vente Immobilier Marrakech",
  description:
    "Comment vendre votre bien immobilier à Marrakech : " +
    "estimation gratuite, visibilité maximale et accompagnement complet " +
    "jusqu'à la signature. Guide expert Kamar Immob.",
  alternates: { canonical: 'https://kamarimmob.com/guide/selling' },
  openGraph: {
    title: "Guide Vente Immobilier Marrakech | Kamar Immob",
    description: "Tout savoir pour vendre votre propriété à Marrakech.",
    url: 'https://kamarimmob.com/guide/selling',
    images: [{ url: '/og-home.svg', width: 1200, height: 630 }],
  },
};

export default function SellingGuideLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
