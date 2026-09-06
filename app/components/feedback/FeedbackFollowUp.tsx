import { Mail } from 'lucide-react';
import FeedbackChips from './FeedbackChips';
import FeedbackMessage from './FeedbackMessage';

export default function FeedbackFollowUp({
  wantFollowUp,
  email,
  error,
  onChoose,
  onEmail,
}: {
  wantFollowUp: boolean | null;
  email: string;
  error?: string;
  onChoose: (wantFollowUp: boolean) => void;
  onEmail: (email: string) => void;
}) {
  return (
    <div className="feedback-followup">
      <FeedbackMessage>Would you like us to follow up?</FeedbackMessage>
      <FeedbackChips
        selected={wantFollowUp == null ? null : wantFollowUp ? 'yes' : 'no'}
        onSelect={(id) => onChoose(id === 'yes')}
        options={[
          { id: 'no', label: 'No, just sharing feedback' },
          { id: 'yes', label: 'Yes, contact me' },
        ]}
      />
      {wantFollowUp ? (
        <div className="feedback-field">
          <label htmlFor="feedback-email">
            <Mail size={14} strokeWidth={2} aria-hidden="true" />
            Email
          </label>
          <input
            id="feedback-email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            value={email}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'feedback-email-error' : undefined}
            onChange={(event) => onEmail(event.target.value)}
          />
          {error ? (
            <p id="feedback-email-error" className="feedback-field-error" role="alert">
              {error}
            </p>
          ) : (
            <p className="feedback-field-hint">We’ll only use this to follow up on your feedback.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
