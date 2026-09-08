'use client';

import { useEffect, useState } from 'react';
import { downloadCertificatePdf, fetchAttempt, type AssessmentResult } from '../../../lib/learn/api';
import { trackEvent } from '../../../lib/tracking';

const PATH_LINKS = [
  { href: '/opportunities?experience=beginner', label: 'General evaluator' },
  { href: '/opportunities?category=Writing', label: 'Writing-focused' },
  { href: '/opportunities?category=Coding', label: 'Technical / coding' },
  { href: '/opportunities?category=Science', label: 'Research / factuality' },
];

function recsFor(key?: string) {
  if (key === 'written_reasoning') return PATH_LINKS.filter((item) => item.label.startsWith('Writing') || item.label.startsWith('General'));
  if (key === 'factuality') return PATH_LINKS.filter((item) => item.label.startsWith('Research') || item.label.startsWith('General'));
  if (key === 'instruction_following' || key === 'attention_to_detail') {
    return PATH_LINKS.filter((item) => item.label.startsWith('General') || item.label.startsWith('Writing'));
  }
  return PATH_LINKS;
}

export default function ResultsView({ attemptId }: { attemptId: string }) {
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAttempt(attemptId)
      .then(setResult)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load results.'));
  }, [attemptId]);

  if (error) return <p className="learn-empty" role="alert">{error}</p>;
  if (!result) return <p className="learn-status">Loading your results…</p>;
  if (!result.submitted) {
    return (
      <p className="learn-empty">
        This assessment is still in progress. <a href="/learn/ai-training-foundations/assessment">Continue</a>
      </p>
    );
  }

  const certificateId = result.certificate?.credentialId;
  const paths = recsFor(result.opportunity ? result.categories?.find((item) => item.label === result.opportunity?.label)?.key : undefined);

  async function download() {
    if (!certificateId) return;
    const blob = await downloadCertificatePdf(certificateId);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${certificateId}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
    trackEvent({ eventType: 'certificate_downloaded' });
  }

  return (
    <div className="learn-results">
      <p className="learn-kicker">Your AI Training Readiness Score</p>
      <p className="learn-big-score">{result.finalScore} <small>/ 100</small></p>
      <h1>{result.levelCopy?.title}</h1>
      <p className="learn-lead">{result.levelCopy?.body}</p>
      {result.usBased === false ? (
        <aside className="learn-callout is-note">
          <p>Current coaching and opportunity recommendations may be focused on U.S.-eligible users. You can still use this educational certificate.</p>
        </aside>
      ) : null}
      <ul className="learn-cats">
        {result.categories?.map((item) => (
          <li key={item.key}>
            <div>
              <strong>{item.label}</strong>
              <span>{item.band}</span>
            </div>
            <b>{item.score} / 100</b>
            <span className="learn-meter"><i style={{ width: `${item.score}%` }} /></span>
          </li>
        ))}
      </ul>
      <div className="learn-split">
        <article>
          <p className="learn-kicker">Your strongest area</p>
          <h2>{result.strongest?.label}</h2>
          <p>{result.strongest?.score} / 100</p>
        </article>
        <article>
          <p className="learn-kicker">Your biggest opportunity</p>
          <h2>{result.opportunity?.label}</h2>
          <p>{result.opportunity?.score} / 100</p>
        </article>
      </div>
      <section>
        <h2>Recommended next steps</h2>
        <ul className="learn-list">
          {result.recommendations?.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="learn-hint">Explore opportunities that may match your current focus. This score does not predict third-party platform acceptance.</p>
        <ul className="learn-path-links">
          {paths.map((item) => (
            <li key={item.href}>
              <a href={item.href} onClick={() => trackEvent({ eventType: 'opportunities_clicked_from_course' })}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </section>
      <div className="learn-pager">
        <a
          className="primary-button"
          href="/opportunities?experience=beginner"
          onClick={() => trackEvent({ eventType: 'opportunities_clicked_from_course' })}
        >
          Explore AI training opportunities
        </a>
        <a
          className="secondary-button on-light"
          href="/#apply"
          onClick={() => trackEvent({ eventType: 'coaching_clicked_from_results' })}
        >
          Review my results with a coach
        </a>
      </div>
      {result.passed && result.certificate ? (
        <section className="learn-cert-cta">
          <h2>Certificate of Completion</h2>
          <p>Credential ID {result.certificate.credentialId}</p>
          <div className="learn-pager">
            <button type="button" className="primary-button" onClick={() => void download()}>
              Download certificate
            </button>
            <a className="secondary-button on-light" href={`/certificate/${certificateId}`}>
              View credential
            </a>
          </div>
        </section>
      ) : (
        <aside className="learn-callout is-note">
          <p>A certificate unlocks at {result.passScore}/100. Review weaker modules, then you can retake the assessment later.</p>
          <p>
            <a href="/learn/ai-training-foundations">Back to course</a>
          </p>
        </aside>
      )}
    </div>
  );
}
