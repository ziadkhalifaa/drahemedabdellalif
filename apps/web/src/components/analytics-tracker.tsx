'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';

const EXCLUDED_PATH_PREFIXES = ['/admin', '/auth'];

export function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Skip admin and auth pages
    const isExcluded = EXCLUDED_PATH_PREFIXES.some(prefix => pathname.includes(prefix));
    if (isExcluded) return;

    // Skip bots
    const isBot = /HeadlessChrome|Googlebot|bingbot|bot|crawler|spider/i.test(navigator.userAgent);
    if (isBot) return;

    const trackPageView = async () => {
      try {
        await api.post('/analytics/track', {
          type: 'page_view',
          payload: {
            url: window.location.href,
            pathname,
            referrer: document.referrer,
            userAgent: navigator.userAgent,
          },
        });
      } catch (e) {
        // Silently fail to not interrupt user experience
      }
    };

    trackPageView();
  }, [pathname, searchParams]);

  return null;
}
