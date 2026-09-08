import { ApiError } from './api';
import { trackingIds } from './tracking';

export type ChatTopic =
  | 'getting_started'
  | 'opportunities'
  | 'application'
  | 'booking'
  | 'profile_match'
  | 'something_else';

export type ChatStatus = 'open' | 'waiting_for_team' | 'waiting_for_user' | 'resolved' | 'closed';

export type ChatSenderType = 'visitor' | 'candidate' | 'team' | 'system';

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderType: ChatSenderType;
  senderLabel: string;
  body: string;
  messageType: string;
  feedbackId?: string | null;
  feedback?: {
    id: string;
    category: string;
    categoryLabel: string;
    subcategory: string | null;
    subcategoryLabel: string | null;
    message: string;
    rating: number | null;
    pagePath: string;
    createdAt: string;
    status?: string;
  } | null;
  createdAt: string;
  readAt: string | null;
  pending?: boolean;
  failed?: boolean;
};

export type ChatConversation = {
  id: string;
  status: ChatStatus;
  topic: string | null;
  topicLabel: string | null;
  visitorId: string | null;
  displayName: string;
  startedFromPage: string | null;
  firstSource: string | null;
  currentFunnelStage: string | null;
  contactEmail: string | null;
  lastMessageAt: string;
  unreadCount?: number;
};

type ChatEnvelope = {
  conversation: ChatConversation | null;
  messages: ChatMessage[];
  unreadCount: number;
  teamOnline: boolean;
  hasMore: boolean;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      ...init,
      credentials: 'include',
      headers: {
        ...(init?.body != null && init.body !== '' ? { 'content-type': 'application/json' } : {}),
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', 'Could not reach the AI Trainers service.');
  }
  const data = (await response.json().catch(() => ({}))) as T & {
    error?: { code?: string; message?: string };
  };
  if (!response.ok) {
    throw new ApiError(
      response.status,
      data.error?.code ?? 'REQUEST_ERROR',
      data.error?.message ?? 'Something went wrong. Please try again.',
    );
  }
  return data;
}

function identityQuery(): string {
  const ids = trackingIds();
  const params = new URLSearchParams();
  if (ids.visitorId) params.set('visitorId', ids.visitorId);
  if (ids.sessionId) params.set('sessionId', ids.sessionId);
  const query = params.toString();
  return query ? `?${query}` : '';
}

export function getChat() {
  return request<ChatEnvelope>(`/v1/chat${identityQuery()}`);
}

export function getChatUnread() {
  return request<{ unreadCount: number; teamOnline: boolean; conversationId: string | null }>(
    `/v1/chat/unread${identityQuery()}`,
  );
}

export function getChatPresence() {
  return request<{ teamOnline: boolean }>('/v1/chat/presence');
}

export function getChatSocketToken() {
  return request<{ token: string }>('/v1/chat/socket-token', {
    method: 'POST',
    body: JSON.stringify({ visitorId: trackingIds().visitorId }),
  });
}

export function sendChatMessage(input: {
  conversationId?: string;
  body: string;
  topic?: ChatTopic;
  pagePath?: string;
  pageUrl?: string;
  contextType?: string;
  opportunityId?: string;
  opportunityTitle?: string;
  opportunityPlatform?: string;
  companyWebsite?: string;
}) {
  const ids = trackingIds();
  return request<{ conversation: ChatConversation; message: ChatMessage; teamOnline: boolean }>('/v1/chat/messages', {
    method: 'POST',
    body: JSON.stringify({
      ...input,
      visitorId: ids.visitorId,
      sessionId: ids.sessionId,
    }),
  });
}

export function listChatMessages(conversationId: string, before?: string) {
  const ids = trackingIds();
  const params = new URLSearchParams();
  if (ids.visitorId) params.set('visitorId', ids.visitorId);
  if (before) params.set('before', before);
  params.set('limit', '40');
  return request<{ messages: ChatMessage[]; hasMore: boolean; unreadCount: number }>(
    `/v1/chat/conversations/${conversationId}/messages?${params.toString()}`,
  );
}

export function markChatRead(conversationId: string) {
  return request<{ ok: boolean }>(`/v1/chat/conversations/${conversationId}/read`, {
    method: 'POST',
    body: JSON.stringify({ visitorId: trackingIds().visitorId }),
  });
}

export function saveChatContactEmail(conversationId: string, email: string) {
  return request<{ conversation: ChatConversation }>(`/v1/chat/conversations/${conversationId}/contact-email`, {
    method: 'POST',
    body: JSON.stringify({ visitorId: trackingIds().visitorId, email }),
  });
}

export function recordChatOpened() {
  const ids = trackingIds();
  return request<{ ok: boolean; teamOnline: boolean }>('/v1/chat/opened', {
    method: 'POST',
    body: JSON.stringify({ visitorId: ids.visitorId, sessionId: ids.sessionId }),
  });
}

export const CHAT_TOPICS: Array<{ id: ChatTopic; label: string }> = [
  { id: 'getting_started', label: 'Getting started' },
  { id: 'opportunities', label: 'Opportunities' },
  { id: 'application', label: 'Application' },
  { id: 'booking', label: 'Booking' },
  { id: 'profile_match', label: 'Profile / Match' },
  { id: 'something_else', label: 'Something else' },
];

export const CHAT_MAX_MESSAGE = 2000;
