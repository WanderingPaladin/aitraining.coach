'use client';

import { LEARN_PATH } from '../../../lib/learn/course';

export default function AssessmentErrorState({
  title = "We couldn't load your assessment.",
  body,
  onRetry,
  retryLabel = 'Try again',
}: {
  title?: string;
  body: string;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  return (
    <div className="learn-empty-state learn-assess-error" role="alert">
      <p className="learn-kicker">Final Assessment</p>
      <h1>{title}</h1>
      <p className="learn-empty">{body}</p>
      <p className="learn-hint">Your existing progress has not been changed.</p>
      <div className="learn-pager">
        {onRetry ? (
          <button type="button" className="primary-button" onClick={onRetry}>
            {retryLabel}
          </button>
        ) : null}
        <a className="secondary-button on-light" href={LEARN_PATH.course}>
          Return to Course
        </a>
      </div>
    </div>
  );
}
