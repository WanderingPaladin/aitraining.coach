'use client';

import { X } from 'lucide-react';
import FeedbackRating from './FeedbackRating';

export default function FeedbackPrompt({
  question,
  onRate,
  onDismiss,
}: {
  question: string;
  onRate: (rating: number) => void;
  onDismiss: () => void;
}) {
  return (
    <aside className="feedback-prompt" aria-label="Quick feedback">
      <div className="feedback-prompt-head">
        <p>{question}</p>
        <button type="button" className="feedback-icon-btn" aria-label="Dismiss" onClick={onDismiss}>
          <X size={14} strokeWidth={2} />
        </button>
      </div>
      <FeedbackRating compact onSelect={onRate} />
    </aside>
  );
}
