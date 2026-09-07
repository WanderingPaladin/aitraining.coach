import { CircleCheckBig } from 'lucide-react';

export default function FeedbackSuccess({
  questionHint,
  onDone,
  onMore,
  onChat,
}: {
  questionHint?: boolean;
  onDone: () => void;
  onMore: () => void;
  onChat?: () => void;
}) {
  return (
    <div className="feedback-success">
      <span className="feedback-success-icon" aria-hidden="true">
        <CircleCheckBig size={32} strokeWidth={2} />
      </span>
      <h3>Thanks — this is genuinely helpful.</h3>
      <p>Your feedback helps us make AI Trainers better.</p>
      {questionHint ? (
        <p className="feedback-success-hint">
          We’ll review your question. You may also find an answer in our{' '}
          <a href="/#faq">FAQ</a>.
        </p>
      ) : null}
      <div className="feedback-success-actions">
        <button type="button" className="feedback-primary" onClick={onDone}>
          Done
        </button>
        <button type="button" className="feedback-secondary" onClick={onMore}>
          Share more feedback
        </button>
        {onChat ? (
          <button type="button" className="feedback-secondary" onClick={onChat}>
            Need a response from us? Chat with Team
          </button>
        ) : null}
      </div>
    </div>
  );
}
