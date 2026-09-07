import { CircleCheckBig } from 'lucide-react';
import { isValidFeedbackEmail } from '../../../lib/feedback-validation';

export default function FeedbackSuccess({
  questionHint,
  askNotify,
  email,
  emailError,
  onEmail,
  onNotify,
  onSkipNotify,
  onDone,
  onChat,
}: {
  questionHint?: boolean;
  askNotify?: boolean;
  email?: string;
  emailError?: string;
  onEmail?: (value: string) => void;
  onNotify?: () => void;
  onSkipNotify?: () => void;
  onDone: () => void;
  onChat?: () => void;
}) {
  return (
    <div className="feedback-success">
      <span className="feedback-success-icon" aria-hidden="true">
        <CircleCheckBig size={32} strokeWidth={2} />
      </span>
      <h3>Thanks — this is genuinely helpful.</h3>
      <p>Our team can reply here if we need more information or have an update.</p>
      {questionHint ? (
        <p className="feedback-success-hint">
          We’ll review your question. You may also find an answer in our{' '}
          <a href="/#faq">FAQ</a>.
        </p>
      ) : null}
      {askNotify ? (
        <div className="chat-email-capture">
          <p>Want to know when our team replies?</p>
          <label htmlFor="feedback-notify-email">Email</label>
          <input
            id="feedback-notify-email"
            type="email"
            autoComplete="email"
            value={email ?? ''}
            onChange={(event) => onEmail?.(event.target.value)}
          />
          {emailError ? <p className="feedback-field-error" role="alert">{emailError}</p> : null}
          <button
            type="button"
            className="feedback-primary"
            disabled={!isValidFeedbackEmail(email ?? '')}
            onClick={onNotify}
          >
            Notify me
          </button>
          <button type="button" className="feedback-secondary" onClick={onSkipNotify}>
            Not now
          </button>
        </div>
      ) : null}
      <div className="feedback-success-actions">
        {onChat ? (
          <button type="button" className="feedback-primary" onClick={onChat}>
            Continue chatting
          </button>
        ) : null}
        <button type="button" className="feedback-secondary" onClick={onDone}>
          Done
        </button>
      </div>
    </div>
  );
}
