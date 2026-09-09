'use client';

export default function ResultsSkeleton({ message = 'Loading your results…' }: { message?: string }) {
  return (
    <div className="learn-results-page" aria-busy="true" aria-live="polite">
      <p className="learn-sr">{message}</p>
      <div className="learn-results-head">
        <div>
          <span className="learn-assess-skel learn-assess-skel-title" />
          <span className="learn-assess-skel learn-assess-skel-copy" />
        </div>
        <span className="learn-assess-skel learn-results-skel-notice" />
      </div>
      <div className="learn-results-hero">
        <div className="learn-results-card">
          <span className="learn-assess-skel learn-results-skel-ring" />
          <span className="learn-assess-skel learn-assess-skel-title" />
          <span className="learn-assess-skel learn-assess-skel-copy" />
          <span className="learn-assess-skel learn-assess-skel-meter" />
        </div>
        <div className="learn-results-card">
          <span className="learn-assess-skel learn-assess-skel-kicker" />
          <span className="learn-assess-skel learn-assess-skel-title" />
          <span className="learn-assess-skel learn-assess-skel-copy" />
          <span className="learn-assess-skel learn-assess-skel-option" />
        </div>
      </div>
      <div className="learn-skill-grid">
        <span className="learn-assess-skel learn-skill-skel" />
        <span className="learn-assess-skel learn-skill-skel" />
        <span className="learn-assess-skel learn-assess-skel-copy learn-skill-skel" />
        <span className="learn-assess-skel learn-skill-skel" />
        <span className="learn-assess-skel learn-skill-skel" />
      </div>
      <div className="learn-results-lower">
        <div className="learn-results-steps">
          <span className="learn-assess-skel learn-results-skel-step" />
          <span className="learn-assess-skel learn-results-skel-step" />
          <span className="learn-assess-skel learn-results-skel-step" />
        </div>
        <span className="learn-assess-skel learn-results-skel-other" />
      </div>
    </div>
  );
}
