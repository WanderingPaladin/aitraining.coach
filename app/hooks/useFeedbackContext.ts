'use client';

import { useMemo, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import { getRouteContext } from '../../lib/feedback-context';

function subscribeHash(onChange: () => void) {
  window.addEventListener('hashchange', onChange);
  window.addEventListener('popstate', onChange);
  return () => {
    window.removeEventListener('hashchange', onChange);
    window.removeEventListener('popstate', onChange);
  };
}

function getHash() {
  return window.location.hash;
}

function getServerHash() {
  return '';
}

export function useFeedbackContext() {
  const pathname = usePathname() || '/';
  const hash = useSyncExternalStore(subscribeHash, getHash, getServerHash);
  const context = useMemo(() => getRouteContext(pathname, hash), [hash, pathname]);
  return {
    pathname,
    pageUrl: typeof window === 'undefined' ? '' : window.location.href,
    context,
  };
}
