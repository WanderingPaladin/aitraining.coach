export default function FeedbackError({
  onRetry,
  onKeep,
}: {
  onRetry: () => void;
  onKeep: () => void;
}) {
  return (
    <div className="feedback-error-state" role="alert">
      <p>Something went wrong while sending your feedback.</p>
      <div className="feedback-success-actions">
        <button type="button" className="feedback-primary" onClick={onRetry}>
          Try again
        </button>
        <button type="button" className="feedback-secondary" onClick={onKeep}>
          Keep my message
        </button>
      </div>
    </div>
  );
}
