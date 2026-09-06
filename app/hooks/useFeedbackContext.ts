'use client';

import { usePathname } from 'next/navigation';
import { getRouteContext } from '../../lib/feedback-context';

export function useFeedbackContext() {
  const pathname = usePathname() || '/';
  const hash = typeof window === 'undefined' ? '' : window.location.hash;
  return {
    pathname,
    pageUrl: typeof window === 'undefined' ? '' : window.location.href,
    context: getRouteContext(pathname, hash),
  };
}
