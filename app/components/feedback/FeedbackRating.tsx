const ratings = [
  { value: 1, emoji: '😕', label: 'Poor' },
  { value: 2, emoji: '😐', label: 'Okay' },
  { value: 3, emoji: '🙂', label: 'Good' },
  { value: 4, emoji: '🤩', label: 'Great' },
] as const;

export default function FeedbackRating({
  value,
  onSelect,
  compact = false,
}: {
  value?: number | null;
  onSelect: (value: number) => void;
  compact?: boolean;
}) {
  return (
    <div className={compact ? 'feedback-rating is-compact' : 'feedback-rating'} role="group" aria-label="Experience rating">
      {ratings.map((rating) => (
        <button
          key={rating.value}
          type="button"
          className={value === rating.value ? 'feedback-rate is-selected' : 'feedback-rate'}
          aria-pressed={value === rating.value}
          aria-label={rating.label}
          onClick={() => onSelect(rating.value)}
        >
          <span aria-hidden="true">{rating.emoji}</span>
          {compact ? null : <small>{rating.label}</small>}
        </button>
      ))}
    </div>
  );
}
