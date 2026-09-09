'use client';

import { ArrowLeft, ArrowRight, Flag } from 'lucide-react';

export default function AssessmentBottomNav({
  index,
  total,
  flagged,
  locked,
  onPrev,
  onNext,
  onFlag,
  onReview,
  onOpenNavigator,
}: {
  index: number;
  total: number;
  flagged: boolean;
  locked?: boolean;
  onPrev: () => void;
  onNext: () => void;
  onFlag: () => void;
  onReview: () => void;
  onOpenNavigator?: () => void;
}) {
  const last = index >= total - 1;

  return (
    <nav className="learn-assess-bottom" aria-label="Assessment questions">
      <div className="shell learn-assess-bottom-inner">
        <button
          type="button"
          className="secondary-button on-light"
          disabled={index === 0 || locked}
          onClick={onPrev}
        >
          <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
          Previous
        </button>
        <div className="learn-assess-bottom-mid">
          {onOpenNavigator ? (
            <button type="button" className="learn-assess-link" onClick={onOpenNavigator}>
              View Questions
            </button>
          ) : null}
          <button
            type="button"
            className={`learn-assess-flag${flagged ? ' is-on' : ''}`}
            aria-pressed={flagged}
            disabled={locked}
            onClick={onFlag}
          >
            <Flag size={16} strokeWidth={2} aria-hidden="true" />
            {flagged ? 'Flagged' : 'Flag for review'}
          </button>
        </div>
        {last ? (
          <button type="button" className="primary-button" disabled={locked} onClick={onReview}>
            Review Answers
            <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
          </button>
        ) : (
          <button type="button" className="primary-button" disabled={locked} onClick={onNext}>
            Next
            <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
          </button>
        )}
      </div>
    </nav>
  );
}
