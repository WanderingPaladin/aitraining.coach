import { FEEDBACK_MAX_MESSAGE } from '../../../lib/feedback-types';

export default function FeedbackTextarea({
  id,
  label,
  value,
  placeholder,
  error,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  const remaining = FEEDBACK_MAX_MESSAGE - value.length;
  return (
    <div className="feedback-field">
      <label htmlFor={id}>{label}</label>
      <textarea
        id={id}
        rows={4}
        maxLength={FEEDBACK_MAX_MESSAGE}
        value={value}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error ${id}-count` : `${id}-count`}
        onChange={(event) => onChange(event.target.value)}
      />
      <div className="feedback-field-meta">
        {error ? (
          <p id={`${id}-error`} className="feedback-field-error" role="alert">
            {error}
          </p>
        ) : (
          <span />
        )}
        <span id={`${id}-count`} className="feedback-char-count">
          {remaining}
        </span>
      </div>
    </div>
  );
}
