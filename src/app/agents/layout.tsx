import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Notre Équipe d'Agents Immobiliers Marrakech",
  description:
    "Rencontrez nos agents immobiliers experts à Marrakech. " +
    "Spécialistes villas, riads et appartements de prestige. " +
    "Profitez d'un accompagnement personnalisé avec Kamar Immob.",
  alternates: { canonical: 'https://kamarimmob.com/agents' },
  openGraph: {
    title: "Notre Équipe d'Agents Immobiliers Marrakech | Kamar Immob",
    description: "Agents immobiliers experts spécialisés luxe à Marrakech.",
    url: 'https://kamarimmob.com/agents',
    images: [{ url: '/og-home.svg', width: 1200, height: 630 }],
  },
};

export default function AgentsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
