import type { RefObject } from 'react';
import BrandMark from './BrandMark';

export default function FeedbackLauncher({
  open,
  onToggle,
  buttonRef,
}: {
  open: boolean;
  onToggle: () => void;
  buttonRef: RefObject<HTMLButtonElement | null>;
}) {
  return (
    <div className="feedback-launcher-wrap">
      <span className="feedback-launcher-label">Give Feedback</span>
      <button
        ref={buttonRef}
        type="button"
        className={open ? 'feedback-launcher is-open' : 'feedback-launcher'}
        aria-label="Give feedback"
        aria-expanded={open}
        aria-controls="feedback-assistant-panel"
        onClick={onToggle}
      >
        <BrandMark className="brand-mark feedback-launcher-mark" />
      </button>
    </div>
  );
}
