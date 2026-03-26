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
  metadataBase: new URL('https://palaisrouge.online'),
  title: {
    default: 'Palais Rouge Immo | Agence Immobilière Luxe Marrakech',
    template: '%s | Palais Rouge Immo — Marrakech',
  },
  description:
    "Palais Rouge Immo — N°1 de l'immobilier de luxe à Marrakech. " +
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
    'Palais Rouge Immo', 'palaisrouge.online',
    'luxury real estate Marrakech', 'buy villa Marrakech',
    'sell villa Marrakech', 'riad for sale Marrakech',
    'property for sale Marrakech Morocco', 'Marrakech real estate agency',
    'invest Marrakech property', 'Marrakech luxury homes',
    'Marrakech villas for sale', 'Palmeraie villa for sale',
    'luxury apartment Marrakech', 'Morocco real estate investment 2026',
    'عقارات فاخرة مراكش', 'شراء فيلا مراكش', 'رياض للبيع مراكش',
    'وكالة عقارية مراكش', 'استثمار عقاري مراكش', 'عقار مراكش',
  ],
  authors: [{ name: 'Palais Rouge Immo', url: 'https://palaisrouge.online' }],
  creator: 'Palais Rouge Immo',
  publisher: 'Palais Rouge Immo',
  category: 'Real Estate',
  alternates: {
    canonical: 'https://palaisrouge.online',
    languages: {
      'fr-MA': 'https://palaisrouge.online',
      'en': 'https://palaisrouge.online',
      'ar-MA': 'https://palaisrouge.online',
      'x-default': 'https://palaisrouge.online',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'fr_MA',
    alternateLocale: ['en_US', 'ar_MA'],
    url: 'https://palaisrouge.online',
    siteName: 'Palais Rouge Immo',
    title: 'Palais Rouge Immo | Agence Immobilière Luxe Marrakech',
    description:
      "N°1 de l'immobilier de luxe à Marrakech. " +
      'Villas, riads, appartements de prestige. ' +
      'Achat, vente, investissement avec Palais Rouge Immo.',
    images: [
      {
        url: 'https://palaisrouge.online/og-home.jpg',
        width: 1200,
        height: 630,
        alt: 'Palais Rouge Immo — Immobilier de Luxe Marrakech',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@palaisrougeimmo',
    creator: '@palaisrougeimmo',
    title: 'Palais Rouge Immo | Immobilier de Luxe Marrakech',
    description: "N°1 immobilier luxe Marrakech. Villas, riads, appartements.",
    images: ['https://palaisrouge.online/og-home.jpg'],
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
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon-16x16.png',
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
        <link rel="alternate" hrefLang="fr-MA" href="https://palaisrouge.online" />
        <link rel="alternate" hrefLang="en" href="https://palaisrouge.online" />
        <link rel="alternate" hrefLang="ar-MA" href="https://palaisrouge.online" />
        <link rel="alternate" hrefLang="x-default" href="https://palaisrouge.online" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://jiqwqiztzsudjwdkbgoj.supabase.co" />
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
            </PropertiesProvider>
          </I18nProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
