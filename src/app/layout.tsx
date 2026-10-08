import type { Metadata } from "next";
import { Suspense } from "react";
import { Playfair_Display, DM_Sans, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { I18nProvider } from "@/context/I18nContext";
import { PropertiesProvider } from "@/context/PropertiesContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CookieConsent from "@/components/CookieConsent";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import AnalyticsPageView from "@/components/AnalyticsPageView";
import { RealEstateAgentJsonLd } from "@/components/seo/JsonLd";
import { PageTracker } from "@/components/PageTracker";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const notoArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-arabic",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://kamarimmob.com'),
  title: {
    default: 'Kamar Immob | Agence Immobilière Luxe Marrakech',
    template: '%s | Kamar Immob — Marrakech',
  },
  description:
    "Kamar Immob — spécialiste de l'immobilier de luxe à Marrakech. " +
    'Achat et vente de villas, riads, appartements prestige. ' +
    'Agence immobilière Marrakech. Buy luxury property Marrakech Morocco.',
  keywords: [
    'immobilier luxe Marrakech', 'agence immobilière Marrakech',
    'achat villa Marrakech', 'vente villa Marrakech',
    'riad à vendre Marrakech', 'appartement luxe Marrakech',
    'investissement immobilier Marrakech', 'propriété prestige Marrakech',
    'villa Palmeraie Marrakech', 'villa Hivernage Marrakech',
    'riad médina Marrakech', 'appartement Guéliz Marrakech',
    'immobilier Marrakech étranger', 'acheter riad Marrakech',
    'location villa Marrakech', 'location riad Marrakech',
    'agence immobilière luxe Marrakech', 'bien immobilier Marrakech',
    'terrain à vendre Marrakech', 'résidence secondaire Marrakech',
    'Kamar Immob', 'kamarimmob.com',
    'luxury real estate Marrakech', 'buy villa Marrakech',
    'sell villa Marrakech', 'riad for sale Marrakech',
    'property for sale Marrakech Morocco', 'Marrakech real estate agency',
    'invest Marrakech property', 'Marrakech luxury homes',
    'Marrakech villas for sale', 'Palmeraie villa for sale',
    'luxury apartment Marrakech', 'Morocco real estate investment 2026',
    'عقارات فاخرة مراكش', 'شراء فيلا مراكش', 'رياض للبيع مراكش',
    'وكالة عقارية مراكش', 'استثمار عقاري مراكش', 'عقار مراكش',
  ],
  authors: [{ name: 'Kamar Immob', url: 'https://kamarimmob.com' }],
  creator: 'Kamar Immob',
  publisher: 'Kamar Immob',
  category: 'Real Estate',
  alternates: {
    canonical: 'https://kamarimmob.com',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_MA',
    alternateLocale: ['en_US', 'ar_MA'],
    url: 'https://kamarimmob.com',
    siteName: 'Kamar Immob',
    title: 'Kamar Immob | Agence Immobilière Luxe Marrakech',
    description:
      "spécialiste de l'immobilier de luxe à Marrakech. " +
      'Villas, riads, appartements de prestige. ' +
      'Achat, vente, investissement avec Kamar Immob.',
    images: [
      {
        url: 'https://kamarimmob.com/og-home.svg',
        width: 1200,
        height: 630,
        alt: 'Kamar Immob — Immobilier de Luxe Marrakech',
        type: 'image/svg+xml',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kamar Immob | Immobilier de Luxe Marrakech',
    description: "Immobilier de luxe à Marrakech. Villas, riads, appartements.",
    images: ['https://kamarimmob.com/og-home.svg'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [{ url: '/favicon.svg?v=20261008', type: 'image/svg+xml' }],
    shortcut: '/favicon.svg?v=20261008',
  },
  manifest: '/site.webmanifest',
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? '',
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION ?? '',
  },
  other: {
    'geo.region': 'MA-07',
    'geo.placename': 'Marrakech',
    'geo.position': '31.6295;-7.9811',
    'ICBM': '31.6295, -7.9811',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
      </head>
      <body
        className={`${playfair.variable} ${dmSans.variable} ${notoArabic.variable} antialiased`}
      >
        <RealEstateAgentJsonLd />
        <AuthProvider>
          <I18nProvider>
            <PropertiesProvider>
              <Navbar />
              <main className="min-h-screen">{children}</main>
              <Footer />
              <CookieConsent />
              <GoogleAnalytics />
              <Suspense fallback={null}>
                <AnalyticsPageView />
              </Suspense>
              <PageTracker />
            </PropertiesProvider>
          </I18nProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
