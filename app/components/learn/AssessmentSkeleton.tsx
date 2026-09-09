'use client';

export default function AssessmentSkeleton({ message = 'Preparing your assessment…' }: { message?: string }) {
  return (
    <div aria-busy="true" aria-live="polite">
      <div className="learn-assess-head">
        <div>
          <span className="learn-assess-skel learn-assess-skel-kicker" />
          <span className="learn-assess-skel learn-assess-skel-title" />
          <span className="learn-assess-skel learn-assess-skel-copy" />
        </div>
        <div className="learn-assess-head-progress">
          <span className="learn-assess-skel learn-assess-skel-copy" />
          <span className="learn-assess-skel learn-assess-skel-meter" />
        </div>
      </div>
      <p className="learn-status">{message}</p>
      <div className="learn-assess-layout">
        <div className="learn-assess-main">
          <div className="learn-question learn-assess-card">
            <span className="learn-assess-skel learn-assess-skel-kicker" />
            <span className="learn-assess-skel learn-assess-skel-prompt" />
            <span className="learn-assess-skel learn-assess-skel-prompt is-short" />
            <span className="learn-assess-skel learn-assess-skel-option" />
            <span className="learn-assess-skel learn-assess-skel-option" />
            <span className="learn-assess-skel learn-assess-skel-option" />
            <span className="learn-assess-skel learn-assess-skel-option" />
          </div>
        </div>
        <aside className="learn-assess-sidebar" aria-hidden="true">
          <div className="learn-assess-side-card">
            <span className="learn-assess-skel learn-assess-skel-kicker" />
            <span className="learn-assess-skel learn-assess-skel-title" />
            <span className="learn-assess-skel learn-assess-skel-meter" />
            <span className="learn-assess-skel learn-assess-skel-copy" />
          </div>
          <div className="learn-assess-side-card">
            <span className="learn-assess-skel learn-assess-skel-kicker" />
            <span className="learn-assess-skel learn-assess-skel-option" />
          </div>
        </aside>
      </div>
    </div>
  );
}
