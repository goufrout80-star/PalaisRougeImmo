import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Contacter Palais Rouge Immo | Agence Immobilière Marrakech",
  description:
    "Contactez Palais Rouge Immo pour acheter, vendre ou louer " +
    "une propriété à Marrakech. Notre équipe d'experts immobiliers " +
    "vous répond sous 24h. Estimation gratuite disponible.",
  alternates: { canonical: 'https://palaisrouge.online/contact' },
  openGraph: {
    title: "Contacter Palais Rouge Immo | Agence Immobilière Marrakech",
    description: "Contactez-nous pour toute question immobilière à Marrakech.",
    url: 'https://palaisrouge.online/contact',
    images: [{ url: '/og-home.svg', width: 1200, height: 630 }],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
