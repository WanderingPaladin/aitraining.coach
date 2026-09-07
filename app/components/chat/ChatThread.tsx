import { Plus, Send } from 'lucide-react';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { CHAT_MAX_MESSAGE, CHAT_TOPICS, type ChatTopic } from '../../../lib/chat';
import type { ChatController } from '../../hooks/useChat';
import FeedbackChips from '../feedback/FeedbackChips';
import FeedbackMessage from '../feedback/FeedbackMessage';
import FeedbackCard from './FeedbackCard';

function formatTime(value: string) {
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

export default function ChatThread({
  chat,
  onGiveFeedback,
}: {
  chat: ChatController;
  onGiveFeedback?: (kind?: 'problem' | 'improvement') => void;
}) {
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
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const showIntro = messages.length === 0;

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages, teamTyping]);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.style.height = '0px';
    input.style.height = `${Math.min(Math.max(input.scrollHeight, 40), 120)}px`;
  }, [draft]);

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
          if (message.messageType === 'feedback') {
            const card = message.feedback;
            return (
              <div key={message.id} className="chat-feedback-wrap">
                <p className="chat-bubble-label">You shared feedback</p>
                <FeedbackCard
                  categoryLabel={card?.categoryLabel ?? 'Feedback'}
                  subcategoryLabel={card?.subcategoryLabel}
                  message={card?.message || message.body}
                />
                <p className="chat-bubble-meta">
                  {message.pending ? 'Sending…' : formatTime(message.createdAt)}
                  {mine && !message.pending ? ' · Sent' : ''}
                </p>
              </div>
            );
          }
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
        <div className="chat-composer-bar">
          {onGiveFeedback ? (
            <div className="chat-plus-wrap">
              <button
                type="button"
                className="chat-plus-btn"
                aria-label="More actions"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((open) => !open)}
              >
                <Plus size={18} strokeWidth={2} />
              </button>
              {menuOpen ? (
                <div className="chat-plus-menu" role="menu">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      onGiveFeedback();
                    }}
                  >
                    Give Feedback
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      onGiveFeedback('problem');
                    }}
                  >
                    Report a Problem
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      onGiveFeedback('improvement');
                    }}
                  >
                    Suggest Improvement
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
          <label htmlFor="chat-composer-input" className="sr-only">
            Type a message
          </label>
          <textarea
            id="chat-composer-input"
            ref={inputRef}
            rows={1}
            value={draft}
            maxLength={CHAT_MAX_MESSAGE}
            placeholder="Type a message"
            autoComplete="off"
            enterKeyHint="send"
            onChange={(event) => updateDraft(event.target.value)}
            onKeyDown={onKeyDown}
          />
          <button type="button" className="chat-send-btn" disabled={!draft.trim() || sending} onClick={() => void send()}>
            Send
            <Send size={15} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
        {error ? <p className="chat-error" role="alert">{error}</p> : null}
      </footer>
    </>
  );
}
