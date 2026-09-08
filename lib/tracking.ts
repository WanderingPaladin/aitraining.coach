const VISITOR_KEY = 'ait_vid';
const SESSION_KEY = 'ait_sid';
const SESSION_AT_KEY = 'ait_sid_at';
const SESSION_MS = 30 * 60 * 1000;
const COOKIE = 'ait_vid';

export type TrackingEventType =
  | 'page_view'
  | 'hero_cta_clicked'
  | 'application_started'
  | 'application_stage_selected'
  | 'booking_started'
  | 'booking_date_selected'
  | 'booking_time_selected'
  | 'profile_created'
  | 'profile_completed'
  | 'opportunity_viewed'
  | 'opportunity_saved'
  | 'opportunity_external_clicked'
  | 'course_viewed'
  | 'course_started'
  | 'module_started'
  | 'module_completed'
  | 'assessment_started'
  | 'assessment_submitted'
  | 'assessment_passed'
  | 'assessment_failed'
  | 'certificate_generated'
  | 'certificate_downloaded'
  | 'opportunities_clicked_from_course'
  | 'coaching_clicked_from_results';

type TrackEventInput = {
  eventType: TrackingEventType;
  pagePath?: string;
  applicationId?: string;
  opportunityId?: string;
  platform?: string;
  metadata?: Record<string, string | number | boolean | null>;
};

function uuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const rand = (Math.random() * 16) | 0;
    const value = char === 'x' ? rand : (rand & 0x3) | 0x8;
    return value.toString(16);
  });
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null;
  }
  const match = document.cookie.split('; ').find((part) => part.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

function writeVisitorCookie(id: string) {
  if (typeof document === 'undefined') {
    return;
  }
  document.cookie = `${COOKIE}=${encodeURIComponent(id)}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

export function getVisitorId(): string {
  if (typeof window === 'undefined') {
    return '';
  }
  const stored = window.localStorage.getItem(VISITOR_KEY) || readCookie(COOKIE);
  if (stored) {
    window.localStorage.setItem(VISITOR_KEY, stored);
    writeVisitorCookie(stored);
    return stored;
  }
  const created = uuid();
  window.localStorage.setItem(VISITOR_KEY, created);
  writeVisitorCookie(created);
  return created;
}

export function getSessionId(): string {
  if (typeof window === 'undefined') {
    return '';
  }
  const now = Date.now();
  const existing = window.sessionStorage.getItem(SESSION_KEY);
  const startedAt = Number(window.sessionStorage.getItem(SESSION_AT_KEY) || 0);
  if (existing && now - startedAt < SESSION_MS) {
    window.sessionStorage.setItem(SESSION_AT_KEY, String(now));
    return existing;
  }
  const created = uuid();
  window.sessionStorage.setItem(SESSION_KEY, created);
  window.sessionStorage.setItem(SESSION_AT_KEY, String(now));
  return created;
}

function currentAttribution() {
  const params = new URLSearchParams(window.location.search);
  return {
    landingPage: `${window.location.pathname}${window.location.search}`.slice(0, 300),
    referrer: document.referrer || undefined,
    utmSource: params.get('utm_source') || undefined,
    utmMedium: params.get('utm_medium') || undefined,
    utmCampaign: params.get('utm_campaign') || undefined,
    utmContent: params.get('utm_content') || undefined,
    utmTerm: params.get('utm_term') || undefined,
    deviceType:
      window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
  };
}

function post(path: string, body: unknown, keepalive = false) {
  const payload = JSON.stringify(body);
  if (keepalive && typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
    const blob = new Blob([payload], { type: 'application/json' });
    if (navigator.sendBeacon(path, blob)) {
      return;
    }
  }
  void fetch(path, {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: payload,
    keepalive,
  }).catch(() => undefined);
}

let sessionReady: Promise<void> | null = null;

export function ensureTrackingSession(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }
  if (sessionReady) {
    return sessionReady;
  }
  sessionReady = new Promise((resolve) => {
    const run = () => {
      post('/v1/track/session', {
        visitorId: getVisitorId(),
        sessionId: getSessionId(),
        ...currentAttribution(),
      });
      resolve();
    };
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => run(), { timeout: 1500 });
    } else {
      setTimeout(run, 0);
    }
  });
  return sessionReady;
}

export function trackEvent(input: TrackEventInput, options?: { keepalive?: boolean }) {
  if (typeof window === 'undefined') {
    return;
  }
  const body = {
    visitorId: getVisitorId(),
    sessionId: getSessionId(),
    events: [
      {
        eventType: input.eventType,
        pagePath: input.pagePath ?? window.location.pathname,
        applicationId: input.applicationId,
        opportunityId: input.opportunityId,
        platform: input.platform,
        metadata: input.metadata,
      },
    ],
  };
  const send = () => post('/v1/track/events', body, options?.keepalive);
  void ensureTrackingSession().then(() => {
    if (options?.keepalive) {
      send();
      return;
    }
    window.setTimeout(send, 0);
  });
}

export function trackingIds() {
  return {
    visitorId: getVisitorId(),
    sessionId: getSessionId(),
  };
}
