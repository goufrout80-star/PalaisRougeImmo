'use client';

import Script from 'next/script';

export default function GoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  if (!gaId) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', {
            page_path: window.location.pathname,
            anonymize_ip: true,
            cookie_flags: 'SameSite=None;Secure',
          });
        `}
      </Script>
    </>
  );
}

/** Track a custom event */
export function trackEvent(action: string, category: string, label?: string, value?: number) {
  if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).gtag) {
    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', action, {
      event_category: category,
      event_label: label,
      value,
    });
  }
}
