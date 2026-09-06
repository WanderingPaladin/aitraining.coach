'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { ensureTrackingSession, trackEvent } from '../../lib/tracking';

export default function JourneyTracker() {
  const pathname = usePathname();
  const seen = useRef(new Set<string>());

  useEffect(() => {
    void ensureTrackingSession();
  }, []);

  useEffect(() => {
    if (!pathname || seen.current.has(pathname)) {
      return;
    }
    seen.current.add(pathname);
    trackEvent({ eventType: 'page_view', pagePath: pathname });
  }, [pathname]);

  return null;
}
