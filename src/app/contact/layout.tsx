import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Contacter Kamar Immob | Agence Immobilière Marrakech",
  description:
    "Contactez Kamar Immob pour acheter, vendre ou louer " +
    "une propriété à Marrakech. Notre équipe d'experts immobiliers " +
    "vous répond sous 24h. Estimation gratuite disponible.",
  alternates: { canonical: 'https://kamarimmob.com/contact' },
  openGraph: {
    title: "Contacter Kamar Immob | Agence Immobilière Marrakech",
    description: "Contactez-nous pour toute question immobilière à Marrakech.",
    url: 'https://kamarimmob.com/contact',
    images: [{ url: '/og-home.svg', width: 1200, height: 630 }],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
