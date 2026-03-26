import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Politique de Cookies",
  robots: { index: false, follow: false },
};

export default function CookiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
