import { Send } from 'lucide-react';
import { useEffect, useRef, type KeyboardEvent } from 'react';
import { CHAT_MAX_MESSAGE, CHAT_TOPICS, type ChatTopic } from '../../../lib/chat';
import type { ChatController } from '../../hooks/useChat';
import FeedbackChips from '../feedback/FeedbackChips';
import FeedbackMessage from '../feedback/FeedbackMessage';

function formatTime(value: string) {
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

export default function ChatThread({ chat }: { chat: ChatController }) {
  const {
    messages,
    teamOnline,
    teamTyping,
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
    conversation,
    setTopic,
    setEmail,
    updateDraft,
    loadEarlier,
    send,
    retry,
    saveEmail,
  } = chat;
  const endRef = useRef<HTMLDivElement>(null);
  const showIntro = messages.length === 0;

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages, teamTyping]);

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void send();
    }
  }

  return (
    <>
      <div className="chat-thread" role="log" aria-live="polite" aria-relevant="additions">
        {hasMore ? (
          <button type="button" className="chat-load-earlier" onClick={() => void loadEarlier()}>
            Load earlier messages
          </button>
        ) : null}
        {loading && !messages.length ? <p className="feedback-status">Loading conversation…</p> : null}
        {showIntro ? <FeedbackMessage>Hi! How can we help?</FeedbackMessage> : null}
        {showIntro && !topic ? (
          <>
            <p className="chat-topic-label">Quick topics</p>
            <FeedbackChips options={CHAT_TOPICS} selected={topic} onSelect={(id) => setTopic(id as ChatTopic)} />
          </>
        ) : topic ? (
          <p className="chat-topic-label">{CHAT_TOPICS.find((item) => item.id === topic)?.label}</p>
        ) : null}
        {topic && showIntro ? (
          <FeedbackMessage>Tell us what you&apos;d like help with.</FeedbackMessage>
        ) : null}
        {messages.map((message) => {
          const mine = message.senderType === 'visitor' || message.senderType === 'candidate';
          return (
            <article key={message.id} className={`chat-bubble ${mine ? 'is-mine' : 'is-team'}`}>
              <p className="chat-bubble-label">{mine ? 'You' : 'AI Trainers Team'}</p>
              <p className="chat-bubble-body">{message.body}</p>
              <p className="chat-bubble-meta">
                {message.pending ? 'Sending…' : formatTime(message.createdAt)}
                {mine && !message.pending && lastVisitor?.id === message.id ? (message.readAt ? ' · Seen' : ' · Sent') : ''}
              </p>
              {message.failed ? (
                <button type="button" className="chat-retry" onClick={() => void retry(message)}>
                  Not sent. Retry
                </button>
              ) : null}
            </article>
          );
        })}
        {teamTyping ? <p className="chat-typing">AI Trainers Team is typing…</p> : null}
        {!teamOnline ? (
          <p className="chat-offline-note">Team currently offline. Send us a message and we&apos;ll get back to you.</p>
        ) : null}
        {askEmail && conversation ? (
          <form
            className="chat-email-capture"
            onSubmit={(event) => {
              event.preventDefault();
              void saveEmail();
            }}
          >
            <p>Would you like us to notify you when we reply?</p>
            <label htmlFor="chat-notify-email">Email</label>
            <input
              id="chat-notify-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />
            <button type="submit" className="feedback-primary">
              Save email
            </button>
          </form>
        ) : null}
        <div ref={endRef} />
      </div>
      <footer className="chat-composer">
        <label className="feedback-honeypot">
          Company website
          <input ref={honeypotRef} type="text" name="companyWebsite" tabIndex={-1} autoComplete="off" aria-hidden="true" />
        </label>
        <label htmlFor="chat-composer-input" className="sr-only">
          Type a message
        </label>
        <textarea
          id="chat-composer-input"
          rows={2}
          value={draft}
          maxLength={CHAT_MAX_MESSAGE}
          placeholder="Type your message..."
          onChange={(event) => updateDraft(event.target.value)}
          onKeyDown={onKeyDown}
        />
        <button type="button" className="feedback-primary" disabled={!draft.trim() || sending} onClick={() => void send()}>
          Send
          <Send size={16} strokeWidth={2} aria-hidden="true" />
        </button>
        {error ? <p className="chat-error" role="alert">{error}</p> : null}
      </footer>
    </>
  );
}
