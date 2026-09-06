import { ChevronRight, type LucideIcon } from 'lucide-react';

export default function FeedbackOption({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button type="button" className="feedback-option" onClick={onClick}>
      <span className="feedback-option-icon" aria-hidden="true">
        <Icon size={18} strokeWidth={2} />
      </span>
      <span className="feedback-option-label">{label}</span>
      <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
    </button>
  );
}
