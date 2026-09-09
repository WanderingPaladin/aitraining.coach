'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { downloadCertificatePdf, fetchAttempt, retryCertificate, type AssessmentResult } from '../../../lib/learn/api';
import { COURSE_TITLE, LEARN_PATH, PASS_SCORE } from '../../../lib/learn/course';
import { learnErrorMessage } from '../../../lib/learn/errors';
import {
  personalizedSteps,
  practiceHrefForCategory,
  skillHighlight,
  skillStatusLabel,
  stageBody,
} from '../../../lib/learn/results-display';
import { isEmptyScore, scoreLocalAttempt } from '../../../lib/learn/score-attempt';
import { readLearnState, writeLearnState } from '../../../lib/learn/storage';
import { trackEvent } from '../../../lib/tracking';
import ResultsSkeleton from './ResultsSkeleton';

const PATH_LINKS = [
  { href: '/opportunities?experience=beginner', label: 'General evaluator' },
  { href: '/opportunities?category=Writing', label: 'Writing-focused' },
  { href: '/opportunities?category=Coding', label: 'Technical / coding' },
  { href: '/opportunities?category=Science', label: 'Research / factuality' },
];

const DISCLAIMER =
  'This assessment is educational and does not predict third-party platform acceptance, project availability, or employment.';

function recoverScore(api: AssessmentResult, attemptId: string): AssessmentResult {
  if (!isEmptyScore(api)) return api;
  const local = readLearnState();
  const sameAttempt = !local.attemptId || local.attemptId === attemptId || local.resultId === attemptId;
  if (!sameAttempt) return api;
  const answers = local.answers ?? {};
  if (Object.keys(answers).length < 3) return api;
  const scored = scoreLocalAttempt(answers, local.questionIds);
  return {
    ...api,
    ...scored,
    attemptId: api.attemptId || attemptId,
    submitted: true,
  };
}

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
  const [certBusy, setCertBusy] = useState(false);

  function load() {
    setError('');
    fetchAttempt(attemptId)
      .then((next) => {
        const recovered = recoverScore(next, attemptId);
        setResult(recovered);
        if (next.submitted) {
          writeLearnState({
            resultId: next.attemptId,
            attemptId,
            passed: Boolean(recovered.passed),
          });
        }
      })
      .catch((err) => setError(learnErrorMessage(err)));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once per attempt
  }, [attemptId]);

  if (error && !result) {
    return (
      <div className="learn-results-page">
        <div className="learn-empty-state learn-assess-error" role="alert">
          <p className="learn-kicker">Your results</p>
          <h1>We couldn&apos;t load your results.</h1>
          <p className="learn-empty">Your assessment submission has not been changed.</p>
          <div className="learn-pager">
            <button type="button" className="primary-button" onClick={() => load()}>
              Try again
            </button>
            <a className="secondary-button on-light" href={LEARN_PATH.course}>
              Back to Course
            </a>
          </div>
        </div>
      </div>
    );
  }
  if (!result) return <ResultsSkeleton />;
  if (!result.submitted) {
    return (
      <div className="learn-results-page">
        <p className="learn-empty">
          This assessment is still in progress.{' '}
          <a href={LEARN_PATH.assessment}>Continue</a>
        </p>
      </div>
    );
  }
  if (isEmptyScore(result)) {
    return (
      <div className="learn-results-page">
        <div className="learn-empty-state" role="alert">
          <p className="learn-kicker">Your AI Training Readiness Score</p>
          <h1>We couldn&apos;t calculate your score</h1>
          <p className="learn-lead">
            Your assessment was submitted, but the saved result came back empty. This is not a 0 score. Retake to score from your answers.
          </p>
          <div className="learn-pager">
            <a className="primary-button" href={`${LEARN_PATH.assessment}?retake=1`}>
              Retake assessment
            </a>
            <a className="secondary-button on-light" href={LEARN_PATH.course}>
              Back to course
            </a>
          </div>
        </div>
      </div>
    );
  }

  const score = result.finalScore ?? 0;
  const passScore = result.passScore ?? PASS_SCORE;
  const certificateId = result.certificate?.credentialId;
  const weakestKey = result.categories?.find((item) => item.label === result.opportunity?.label)?.key;
  const paths = recsFor(weakestKey);
  const practiceHref = practiceHrefForCategory(weakestKey);
  const steps = personalizedSteps(result);
  const remaining = Math.max(0, passScore - score);
  const certPercent = Math.min(100, Math.round((score / Math.max(1, passScore)) * 100));
  const body = stageBody(result);

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
    <div className="learn-results-page">
      <a className="learn-results-back" href={LEARN_PATH.course}>
        <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
        Back to {COURSE_TITLE}
      </a>
      <header className="learn-results-head">
        <p className="learn-kicker">Your results</p>
        <h1>Your {COURSE_TITLE} Results</h1>
        <p className="learn-lead">See what you&apos;re doing well and where to focus next.</p>
      </header>

      <div className="learn-results-hero">
        <section className="learn-results-card learn-results-score" aria-labelledby="learn-results-score-title">
          <div
            className="learn-score-ring"
            style={{ ['--p' as string]: score }}
            role="img"
            aria-label={`${score} out of 100`}
          >
            <div className="learn-score-ring-inner">
              <p className="learn-big-score">
                {score} <small>/ 100</small>
              </p>
            </div>
          </div>
          <h2 id="learn-results-score-title">{result.levelCopy?.title}</h2>
          <p className="learn-lead">{body}</p>
          {result.passed ? (
            <p className="learn-results-cert-note">
              {result.certificate ? 'Certificate unlocked' : 'Certificate requirement met'}
            </p>
          ) : (
            <div className="learn-results-cert-progress">
              <p>
                Certificate progress <b>{score} / {passScore} required</b>
              </p>
              <span
                className="learn-meter"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={passScore}
                aria-valuenow={Math.min(score, passScore)}
                aria-label={`Certificate progress ${score} of ${passScore}`}
              >
                <i style={{ width: `${certPercent}%` }} />
              </span>
              <p className="learn-hint">
                {remaining} {remaining === 1 ? 'point' : 'points'} to reach the certificate threshold
              </p>
            </div>
          )}
        </section>

        <aside className="learn-results-card learn-results-next">
          <p className="learn-kicker">Your next best step</p>
          <h2>Your next best step</h2>
          {result.strongest ? (
            <p className="learn-results-next-row">
              <span>Strongest area</span>
              <b>{result.strongest.label}</b>
              <small>{result.strongest.score} / 100</small>
            </p>
          ) : null}
          {result.opportunity ? (
            <p className="learn-results-next-row">
              <span>Biggest opportunity</span>
              <b>{result.opportunity.label}</b>
              <small>{result.opportunity.score} / 100</small>
            </p>
          ) : null}
          <a
            className="primary-button"
            href="/#apply"
            onClick={() => trackEvent({ eventType: 'coaching_clicked_from_results' })}
          >
            Review my results with a coach
          </a>
          <p className="learn-hint">
            Talk through your results and get a clearer practical next-step plan.
          </p>
          <p className="learn-results-note">Free intro conversation</p>
        </aside>
      </div>

      {result.usBased === false ? (
        <aside className="learn-callout is-tip">
          <p>
            Current coaching and opportunity recommendations may be focused on U.S.-eligible users. You can still use
            this educational certificate.
          </p>
        </aside>
      ) : null}

      <section className="learn-results-section">
        <h2>Your Skill Breakdown</h2>
        <p className="learn-lead">See how you performed across the five core evaluation skills.</p>
        <ul className="learn-skill-grid">
          {result.categories?.map((item) => {
            const highlight = skillHighlight(item, result.strongest, result.opportunity);
            const status = skillStatusLabel(highlight, item.band);
            return (
              <li key={item.key} className={`learn-skill-card${highlight ? ` is-${highlight}` : ''}`}>
                <div className="learn-skill-card-top">
                  <h3>{item.label}</h3>
                  {status ? <span className="learn-overview-badge">{status}</span> : null}
                </div>
                <p className="learn-skill-score">
                  {item.score} <small>/ 100</small>
                </p>
                <span
                  className="learn-meter"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={item.score}
                  aria-label={`${item.label} ${item.score} out of 100`}
                >
                  <i style={{ width: `${item.score}%` }} />
                </span>
                {item.insight ? <p className="learn-hint">{item.insight}</p> : null}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="learn-results-section">
        <h2>Your Personalized Next Steps</h2>
        <ol className="learn-results-steps">
          {steps.map((step) => (
            <li key={step.n}>
              <span className="learn-results-step-n" aria-hidden="true">
                {step.n}
              </span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
                {step.href && step.cta ? (
                  <a
                    className={step.href === '/#apply' ? 'primary-button' : 'secondary-button on-light'}
                    href={step.href}
                    onClick={
                      step.href === '/#apply'
                        ? () => trackEvent({ eventType: 'coaching_clicked_from_results' })
                        : undefined
                    }
                  >
                    {step.cta}
                    <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
                  </a>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
        <div className="learn-results-actions">
          <a className="secondary-button on-light" href={practiceHref}>
            Practice my weakest skill
          </a>
        </div>
      </section>

      <section className="learn-results-card learn-results-coach">
        <p className="learn-kicker">Coaching</p>
        <h2>Want help turning these results into a plan?</h2>
        <p className="learn-lead">
          A coach can walk through your assessment with you, discuss your background, and help you understand which
          skills to work on next.
        </p>
        <a
          className="primary-button"
          href="/#apply"
          onClick={() => trackEvent({ eventType: 'coaching_clicked_from_results' })}
        >
          Review my results with a coach
        </a>
        <p className="learn-results-note">Free introductory conversation</p>
      </section>

      <section className="learn-results-section">
        <h2>Explore opportunities</h2>
        <p className="learn-lead">
          Browse opportunities that may match your professional or academic background.
        </p>
        <ul className="learn-path-links">
          {paths.map((item) => (
            <li key={item.href}>
              <a href={item.href} onClick={() => trackEvent({ eventType: 'opportunities_clicked_from_course' })}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <a
          className="secondary-button on-light"
          href="/opportunities?experience=beginner"
          onClick={() => trackEvent({ eventType: 'opportunities_clicked_from_course' })}
        >
          Explore recommended opportunities
        </a>
        <p className="learn-disclaimer">{DISCLAIMER}</p>
      </section>

      {result.passed && result.certificate ? (
        <section className="learn-results-card learn-cert-cta">
          <p className="learn-kicker">Certificate unlocked</p>
          <h2>Congratulations — you&apos;ve met the course assessment requirement.</h2>
          <p>Credential ID {result.certificate.credentialId}</p>
          <div className="learn-pager">
            <button type="button" className="primary-button" onClick={() => void download()}>
              Download certificate
            </button>
            <a className="secondary-button on-light" href={LEARN_PATH.certificate(certificateId ?? '')}>
              View certificate
            </a>
          </div>
        </section>
      ) : result.passed ? (
        <aside className="learn-results-card" role="status">
          <p className="learn-kicker">Certificate</p>
          <h2>You passed the assessment, but we couldn&apos;t prepare your certificate yet.</h2>
          <button
            type="button"
            className="primary-button"
            disabled={certBusy}
            onClick={() => {
              setCertBusy(true);
              retryCertificate(attemptId)
                .then((next) => {
                  setResult(next);
                  if (next.certificate) trackEvent({ eventType: 'certificate_generated' });
                })
                .catch(() => {})
                .finally(() => setCertBusy(false));
            }}
          >
            {certBusy ? 'Preparing…' : 'Try again'}
          </button>
        </aside>
      ) : (
        <section className="learn-results-card">
          <p className="learn-kicker">Certificate progress</p>
          <p className="learn-results-cert-score">
            {score} / {passScore}
          </p>
          <p className="learn-lead">
            Keep building your skills. Reach {passScore}/100 on the assessment to unlock your AI Training Foundations
            Certificate of Completion.
          </p>
          <div className="learn-pager">
            <a className="secondary-button on-light" href={practiceHref}>
              Practice recommended skills
            </a>
          </div>
          <a className="learn-results-quiet" href={`${LEARN_PATH.assessment}?retake=1`}>
            Retake assessment later
          </a>
        </section>
      )}

      {!result.passed ? null : (
        <p className="learn-results-foot">
          <a className="learn-results-quiet" href={`${LEARN_PATH.assessment}?retake=1`}>
            Retake assessment
          </a>
        </p>
      )}
    </div>
  );
}
