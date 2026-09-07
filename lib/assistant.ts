export const ASSISTANT_OPEN_EVENT = 'ait-assistant-open';

export type AssistantView = 'home' | 'feedback' | 'chat';

export type AssistantOpenDetail = {
  view?: AssistantView;
  topic?: 'getting_started' | 'opportunities' | 'application' | 'booking' | 'profile_match' | 'something_else';
  opportunityId?: string;
  opportunityTitle?: string;
  opportunityPlatform?: string;
  contextType?: string;
};

export function openAssistant(detail: AssistantOpenDetail = {}): void {
  window.dispatchEvent(new CustomEvent(ASSISTANT_OPEN_EVENT, { detail }));
}

export function realtimeUrl(): string {
  if (process.env.NEXT_PUBLIC_REALTIME_URL) {
    return process.env.NEXT_PUBLIC_REALTIME_URL;
  }
  if (typeof window === 'undefined') {
    return '';
  }
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') {
    return 'http://127.0.0.1:4000';
  }
  return 'https://api.aitrainers.coach';
}
