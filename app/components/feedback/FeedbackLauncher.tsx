import type { RefObject } from 'react';
import BrandMark from './BrandMark';

export default function FeedbackLauncher({
  open,
  onToggle,
  buttonRef,
  unreadCount = 0,
}: {
  open: boolean;
  onToggle: () => void;
  buttonRef: RefObject<HTMLButtonElement | null>;
  unreadCount?: number;
}) {
  return (
    <div className="feedback-launcher-wrap">
      <span className="feedback-launcher-label">Chat with us</span>
      <button
        ref={buttonRef}
        type="button"
        className={open ? 'feedback-launcher is-open' : 'feedback-launcher'}
        aria-label={unreadCount ? `Chat with us, ${unreadCount} unread` : 'Chat with us'}
        aria-expanded={open}
        aria-controls="feedback-assistant-panel"
        onClick={onToggle}
      >
        <BrandMark className="brand-mark feedback-launcher-mark" />
        {unreadCount > 0 ? <span className="chat-unread-badge">{unreadCount > 9 ? '9+' : unreadCount}</span> : null}
      </button>
    </div>
  );
}
