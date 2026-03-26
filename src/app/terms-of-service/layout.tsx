import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation",
  robots: { index: false, follow: false },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
