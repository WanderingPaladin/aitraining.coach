import { ChevronRight, type LucideIcon } from 'lucide-react';
import { pressProps } from '../../../lib/press';

export default function FeedbackOption({
  icon: Icon,
  label,
  description,
  primary = false,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  description?: string;
  primary?: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" className={`feedback-option${primary ? ' is-primary' : ''}`} {...pressProps(onClick)}>
      <span className="feedback-option-icon" aria-hidden="true">
        <Icon size={18} strokeWidth={2} />
      </span>
      <span className="feedback-option-copy">
        <span className="feedback-option-label">{label}</span>
        {description ? <span className="feedback-option-desc">{description}</span> : null}
      </span>
      <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
    </button>
  );
}
