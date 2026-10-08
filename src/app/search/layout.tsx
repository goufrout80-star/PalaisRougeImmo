import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Rechercher une Propriété à Marrakech",
  description:
    "Trouvez votre villa, riad ou appartement idéal à Marrakech. " +
    "Filtrez par prix, quartier, surface et type de bien. " +
    "Recherche avancée — Kamar Immob, agence immobilière de luxe.",
  alternates: { canonical: 'https://kamarimmob.com/search' },
  openGraph: {
    title: "Rechercher une Propriété à Marrakech | Kamar Immob",
    description: "Recherche avancée de propriétés de luxe à Marrakech.",
    url: 'https://kamarimmob.com/search',
    images: [{ url: '/og-home.svg', width: 1200, height: 630 }],
  },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
