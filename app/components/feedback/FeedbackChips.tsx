import type { FeedbackChip } from '../../../lib/feedback-types';
import { pressProps } from '../../../lib/press';

export default function FeedbackChips({
  options,
  selected,
  onSelect,
}: {
  options: FeedbackChip[];
  selected?: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="feedback-chips" role="group">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          className={selected === option.id ? 'feedback-chip is-selected' : 'feedback-chip'}
          aria-pressed={selected === option.id}
          {...pressProps(() => onSelect(option.id))}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
