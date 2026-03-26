'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function AnalyticsPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!(window as any).gtag) return;

    const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    if (!GA_ID) return;

    const url = pathname + (searchParams.toString() ? '?' + searchParams.toString() : '');
    (window as any).gtag('config', GA_ID, {
      page_path: url,
    });
  }, [pathname, searchParams]);

  return null;
}
