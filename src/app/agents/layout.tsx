import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Notre Équipe d'Agents Immobiliers Marrakech",
  description:
    "Rencontrez nos agents immobiliers experts à Marrakech. " +
    "Spécialistes villas, riads et appartements de prestige.",
  alternates: { canonical: 'https://palaisrouge.online/agents' },
  openGraph: {
    title: "Notre Équipe d'Agents Immobiliers Marrakech | Palais Rouge Immo",
    description: "Agents immobiliers experts spécialisés luxe à Marrakech.",
    url: 'https://palaisrouge.online/agents',
    images: [{ url: '/og-home.jpg', width: 1200, height: 630 }],
  },
};

export default function AgentsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
