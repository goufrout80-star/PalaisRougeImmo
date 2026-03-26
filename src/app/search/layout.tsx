import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Rechercher une Propriété à Marrakech",
  description:
    "Trouvez votre villa, riad ou appartement idéal à Marrakech. " +
    "Filtrez par prix, quartier, surface et type de bien.",
  alternates: { canonical: 'https://palaisrouge.online/search' },
  openGraph: {
    title: "Rechercher une Propriété à Marrakech | Palais Rouge Immo",
    description: "Recherche avancée de propriétés de luxe à Marrakech.",
    url: 'https://palaisrouge.online/search',
    images: [{ url: '/og-home.jpg', width: 1200, height: 630 }],
  },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
