'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CHAT_MAX_MESSAGE,
  getChat,
  getChatUnread,
  listChatMessages,
  markChatRead,
  recordChatOpened,
  saveChatContactEmail,
  sendChatMessage,
  type ChatConversation,
  type ChatMessage,
  type ChatTopic,
} from '../../lib/chat';
import { getChatSocket } from '../../lib/chat-socket';
import { trackingIds } from '../../lib/tracking';
import { useAuth } from '../components/AuthProvider';

const DRAFT_KEY = 'ait.chat.draft.v1';

export type ChatContext = {
  topic?: ChatTopic;
  opportunityId?: string;
  opportunityTitle?: string;
  opportunityPlatform?: string;
  contextType?: string;
};

function mergeMessages(current: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] {
  const map = new Map<string, ChatMessage>();
  for (const item of [...current, ...incoming]) {
    map.set(item.id, item);
  }
  return [...map.values()].sort((a, b) => {
    const time = a.createdAt.localeCompare(b.createdAt);
    return time !== 0 ? time : a.id.localeCompare(b.id);
  });
}

export function useChat() {
  const { user } = useAuth();
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [teamOnline, setTeamOnline] = useState(false);
  const [teamTyping, setTeamTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [topic, setTopic] = useState<ChatTopic | null>(null);
  const [askEmail, setAskEmail] = useState(false);
  const [email, setEmail] = useState('');
  const contextRef = useRef<ChatContext>({});
  const typingTimer = useRef<number | null>(null);
  const joined = useRef<string | null>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const activeRef = useRef(false);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(DRAFT_KEY);
      if (saved) setDraft(saved);
    } catch {
      // ignore
    }
    void getChatUnread()
      .then((result) => {
        setUnreadCount(result.unreadCount);
        setTeamOnline(result.teamOnline);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    try {
      if (draft) sessionStorage.setItem(DRAFT_KEY, draft);
      else sessionStorage.removeItem(DRAFT_KEY);
    } catch {
      // ignore
    }
  }, [draft]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getChat();
      setConversation(result.conversation);
      setMessages(result.messages);
      setUnreadCount(result.unreadCount);
      setTeamOnline(result.teamOnline);
      setHasMore(result.hasMore);
      if (result.conversation?.topic) {
        setTopic(result.conversation.topic as ChatTopic);
      }
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  const connect = useCallback(async (conversationId?: string | null) => {
    const socket = await getChatSocket();
    if (!socket) return;
    socket.off('message:new');
    socket.off('message:read');
    socket.off('presence:update');
    socket.off('typing:start');
    socket.off('typing:stop');
    socket.off('connect');
    socket.on('presence:update', (payload: { teamOnline?: boolean }) => {
      if (typeof payload?.teamOnline === 'boolean') setTeamOnline(payload.teamOnline);
    });
    socket.on('typing:start', (payload: { role?: string }) => {
      if (payload?.role === 'team') setTeamTyping(true);
    });
    socket.on('typing:stop', (payload: { role?: string }) => {
      if (payload?.role === 'team') setTeamTyping(false);
    });
    socket.on('message:new', (payload: { conversation?: ChatConversation; message?: ChatMessage; teamOnline?: boolean }) => {
      if (payload.teamOnline != null) setTeamOnline(payload.teamOnline);
      if (payload.conversation) setConversation(payload.conversation);
      if (payload.message) {
        setMessages((current) => mergeMessages(current.filter((item) => !item.pending || item.id === payload.message!.id), [payload.message!]));
        const fromTeam = payload.message.senderType === 'team' || payload.message.senderType === 'system';
        if (fromTeam) {
          if (activeRef.current) {
            void markChatRead(payload.message.conversationId).then(() => setUnreadCount(0)).catch(() => {});
          } else {
            setUnreadCount((count) => count + 1);
          }
        }
      }
    });
    socket.on('message:read', (payload: { reader?: string }) => {
      if (payload?.reader === 'team') {
        setMessages((current) =>
          current.map((item) =>
            item.senderType === 'visitor' || item.senderType === 'candidate'
              ? { ...item, readAt: item.readAt ?? new Date().toISOString() }
              : item,
          ),
        );
      }
    });
    socket.on('connect', () => {
      void load();
      if (conversationId || joined.current) {
        socket.emit('conversation:join', conversationId || joined.current);
      }
    });
    if (conversationId) {
      socket.emit('conversation:join', conversationId, (result: { ok: boolean }) => {
        if (result?.ok) joined.current = conversationId;
      });
    }
  }, [load]);

  const openChat = useCallback(
    async (context?: ChatContext) => {
      if (context) contextRef.current = { ...contextRef.current, ...context };
      if (context?.topic) setTopic(context.topic);
      void recordChatOpened().then((result) => setTeamOnline(result.teamOnline)).catch(() => {});
      const result = await load();
      await connect(result.conversation?.id);
      if (result.conversation && result.unreadCount) {
        void markChatRead(result.conversation.id).then(() => setUnreadCount(0));
      }
      if (user?.email) setEmail(user.email);
    },
    [connect, load, user?.email],
  );

  const loadEarlier = useCallback(async () => {
    if (!conversation || !hasMore || !messages[0]) return;
    const result = await listChatMessages(conversation.id, messages[0].id);
    setMessages((current) => mergeMessages(result.messages, current));
    setHasMore(result.hasMore);
  }, [conversation, hasMore, messages]);

  const emitTyping = useCallback((active: boolean) => {
    if (!conversation) return;
    void getChatSocket().then((socket) => {
      socket?.emit(active ? 'typing:start' : 'typing:stop', conversation.id);
    });
  }, [conversation]);

  const updateDraft = useCallback((value: string) => {
    setDraft(value.slice(0, CHAT_MAX_MESSAGE));
    emitTyping(true);
    if (typingTimer.current) window.clearTimeout(typingTimer.current);
    typingTimer.current = window.setTimeout(() => emitTyping(false), 1200);
  }, [emitTyping]);

  const sendBody = useCallback(async (raw: string) => {
    const body = raw.trim();
    if (!body || sending) return;
    setError('');
    setSending(true);
    emitTyping(false);
    const tempId = `pending:${Date.now()}`;
    const pending: ChatMessage = {
      id: tempId,
      conversationId: conversation?.id ?? 'pending',
      senderType: user ? 'candidate' : 'visitor',
      senderLabel: 'You',
      body,
      messageType: 'text',
      createdAt: new Date().toISOString(),
      readAt: null,
      pending: true,
    };
    setMessages((current) => mergeMessages(current, [pending]));
    setDraft('');
    try {
      const result = await sendChatMessage({
        conversationId: conversation?.id,
        body,
        topic: topic ?? undefined,
        pagePath: window.location.pathname,
        pageUrl: window.location.href,
        companyWebsite: honeypotRef.current?.value ?? '',
        ...contextRef.current,
      });
      setConversation(result.conversation);
      setTeamOnline(result.teamOnline);
      setMessages((current) =>
        mergeMessages(
          current.filter((item) => item.id !== tempId),
          [result.message],
        ),
      );
      await connect(result.conversation.id);
      if (!result.teamOnline && !user?.email && !result.conversation.contactEmail) {
        setAskEmail(true);
      }
      try {
        sessionStorage.removeItem(DRAFT_KEY);
      } catch {
        // ignore
      }
    } catch (err) {
      setMessages((current) =>
        current.map((item) => (item.id === tempId ? { ...item, pending: false, failed: true } : item)),
      );
      setDraft(body);
      setError(err instanceof Error ? err.message : 'Message was not sent.');
    } finally {
      setSending(false);
    }
  }, [connect, conversation?.id, emitTyping, sending, topic, user]);

  const send = useCallback(async () => {
    await sendBody(draft);
  }, [draft, sendBody]);

  const retry = useCallback(
    async (message: ChatMessage) => {
      setMessages((current) => current.filter((item) => item.id !== message.id));
      await sendBody(message.body);
    },
    [sendBody],
  );

  const saveEmail = useCallback(async () => {
    if (!conversation || !email.trim()) return;
    const result = await saveChatContactEmail(conversation.id, email.trim());
    setConversation(result.conversation);
    setAskEmail(false);
  }, [conversation, email]);

  const lastVisitor = useMemo(
    () => [...messages].reverse().find((item) => item.senderType === 'visitor' || item.senderType === 'candidate'),
    [messages],
  );

  const setActive = useCallback((active: boolean) => {
    activeRef.current = active;
    if (active && conversation?.id) {
      void markChatRead(conversation.id).then(() => setUnreadCount(0)).catch(() => {});
    }
  }, [conversation?.id]);

  return {
    conversation,
    messages,
    teamOnline,
    teamTyping,
    unreadCount,
    hasMore,
    loading,
    sending,
    draft,
    error,
    topic,
    askEmail,
    email,
    lastVisitor,
    honeypotRef,
    visitorId: trackingIds().visitorId,
    setTopic,
    setEmail,
    setAskEmail,
    updateDraft,
    openChat,
    loadEarlier,
    send,
    retry,
    saveEmail,
    setActive,
    setContext: (context: ChatContext) => {
      contextRef.current = { ...contextRef.current, ...context };
    },
  };
}

export type ChatController = ReturnType<typeof useChat>;
