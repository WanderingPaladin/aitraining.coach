'use client';

export default function LearnError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="journal-light">
      <div className="shell journal-main">
        <p className="learn-kicker">Learn</p>
        <h1>Something went wrong</h1>
        <p className="learn-lead">We couldn&apos;t load this part of your course.</p>
        <div className="learn-pager">
          <button type="button" className="primary-button" onClick={() => reset()}>
            Try again
          </button>
          <a className="secondary-button on-light" href="/learn/ai-training-foundations">
            Back to course
          </a>
        </div>
      </div>
    </div>
  );
}
