'use client';

import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Compass,
  FileText,
  Focus,
  GitCompare,
  GraduationCap,
  ListChecks,
  PenLine,
  RotateCcw,
  SearchCheck,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';
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

const OPPORTUNITIES_DISCLAIMER =
  'Assessment results are educational and do not predict third-party platform acceptance, employment, project availability, or income.';

const SKILL_ICONS = {
  instruction_following: ListChecks,
  response_evaluation: GitCompare,
  factuality: SearchCheck,
  written_reasoning: PenLine,
  attention_to_detail: Focus,
} as const;

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
              Back to course
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
  const practiceHref = practiceHrefForCategory(weakestKey);
  const steps = personalizedSteps(result);
  const remaining = Math.max(0, passScore - score);
  const certPercent = Math.min(100, Math.round((score / Math.max(1, passScore)) * 100));
  const body = stageBody(result);
  const sentenceEnd = body.indexOf('. ');
  const headline = sentenceEnd > 0 ? body.slice(0, sentenceEnd + 1) : result.levelCopy?.title || 'Your result';
  const rest = sentenceEnd > 0 ? body.slice(sentenceEnd + 1).trim() : '';
  const certificateHref = certificateId ? LEARN_PATH.certificate(certificateId) : LEARN_PATH.landing;
  const paths = recsFor(weakestKey);

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
        <div>
          <h1>Your Assessment Results</h1>
          <p className="learn-lead">
            Here’s how you did and where to focus next. This assessment measures specific evaluation skills and is part of
            your learning journey.
          </p>
        </div>
        <aside className="learn-results-notice">
          <GraduationCap size={20} strokeWidth={2} aria-hidden="true" />
          <div>
            <strong>This is an educational assessment.</strong>
            <p>Your score does not guarantee employment, platform acceptance, project availability, or income.</p>
          </div>
        </aside>
      </header>

      <div className="learn-results-hero">
        <section className="learn-results-card learn-results-score" aria-labelledby="learn-results-score-title">
          <div className="learn-results-score-top">
            <ScoreRing score={score} />
            <div>
              {result.levelCopy?.title ? <p className="learn-results-stage">{result.levelCopy.title}</p> : null}
              <h2 id="learn-results-score-title">{headline}</h2>
              {rest || (sentenceEnd <= 0 && body) ? <p className="learn-lead">{rest || body}</p> : null}
            </div>
          </div>
          <div className="learn-results-cert-progress">
            <p>
              <FileText size={16} strokeWidth={2} aria-hidden="true" />
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
            <div className="learn-results-cert-foot">
              {result.passed ? (
                <p className="learn-results-cert-note">
                  {result.certificate ? 'Certificate unlocked' : 'Certificate requirement met'}
                </p>
              ) : (
                <p className="learn-hint">
                  {remaining} {remaining === 1 ? 'point' : 'points'} to reach your certificate
                </p>
              )}
              {result.passed && !result.certificate ? (
                <button
                  type="button"
                  className="learn-text-btn"
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
              ) : (
                <a className="learn-text-btn" href={certificateHref}>
                  About the certificate
                  <ArrowRight size={14} strokeWidth={2} aria-hidden="true" />
                </a>
              )}
            </div>
          </div>
        </section>

        <aside className="learn-results-card learn-results-next">
          <p className="learn-kicker">
            <Sparkles size={14} strokeWidth={2} aria-hidden="true" />
            Your next best step
          </p>
          <h2>Your next best step</h2>
          <p>
            Get personalized guidance from a coach who can review your results, answer your questions, and help you
            create a practical next-step plan.
          </p>
          <a
            className="primary-button"
            href="/#apply"
            onClick={() => trackEvent({ eventType: 'coaching_clicked_from_results' })}
          >
            Review my results with a coach
            <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
          </a>
          <p className="learn-results-note">
            <Calendar size={14} strokeWidth={2} aria-hidden="true" />
            Free introductory conversation
          </p>
          {result.strongest ? (
            <div className="learn-results-next-row is-strongest">
              <span>
                <TrendingUp size={14} strokeWidth={2} aria-hidden="true" />
                Your strongest area
              </span>
              <b>{result.strongest.label}</b>
              <small>{result.strongest.score} / 100</small>
              <span
                className="learn-meter"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={result.strongest.score}
                aria-label={`${result.strongest.label} ${result.strongest.score} out of 100`}
              >
                <i style={{ width: `${result.strongest.score}%` }} />
              </span>
            </div>
          ) : null}
          {result.opportunity ? (
            <div className="learn-results-next-row is-focus">
              <span>
                <Target size={14} strokeWidth={2} aria-hidden="true" />
                Your biggest opportunity
              </span>
              <b>{result.opportunity.label}</b>
              <small>{result.opportunity.score} / 100</small>
              <span
                className="learn-meter"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={result.opportunity.score}
                aria-label={`${result.opportunity.label} ${result.opportunity.score} out of 100`}
              >
                <i style={{ width: `${result.opportunity.score}%` }} />
              </span>
            </div>
          ) : null}
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
        <div className="learn-results-section-head">
          <div>
            <h2>Your Skill Breakdown</h2>
            <p className="learn-lead">See how you performed across the five core evaluation skills.</p>
          </div>
          <a className="learn-text-btn" href={LEARN_PATH.landing}>
            About these skills
            <ArrowRight size={14} strokeWidth={2} aria-hidden="true" />
          </a>
        </div>
        <ul className="learn-skill-grid">
          {result.categories?.map((item) => {
            const highlight = skillHighlight(item, result.strongest, result.opportunity);
            const status = skillStatusLabel(highlight, item.band);
            const Icon = SKILL_ICONS[item.key as keyof typeof SKILL_ICONS] ?? ListChecks;
            return (
              <li key={item.key} className={`learn-skill-card${highlight ? ` is-${highlight}` : ''}`}>
                <div className="learn-skill-card-top">
                  <span className="learn-results-skill-icon" aria-hidden="true">
                    <Icon size={18} strokeWidth={2} />
                  </span>
                  {status ? <span className="learn-results-skill-badge">{status}</span> : null}
                </div>
                <h3>{item.label}</h3>
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
                <a className="learn-text-btn" href={practiceHrefForCategory(item.key)}>
                  Learn how to improve
                  <ArrowRight size={14} strokeWidth={2} aria-hidden="true" />
                </a>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="learn-results-lower">
        <section className="learn-results-section">
          <h2>Your Personalized Next Steps</h2>
          <p className="learn-lead">Based on your results, here are some practical ways to improve.</p>
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
                      className="learn-text-btn"
                      href={step.href}
                      onClick={
                        step.href === '/#apply'
                          ? () => trackEvent({ eventType: 'coaching_clicked_from_results' })
                          : undefined
                      }
                    >
                      {step.cta}
                      <ArrowRight size={14} strokeWidth={2} aria-hidden="true" />
                    </a>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <aside className="learn-results-card learn-results-other">
          <h2>Other actions</h2>
          <ul>
            <li>
              <a href={practiceHref}>
                <Target size={16} strokeWidth={2} aria-hidden="true" />
                Practice my weakest skill
              </a>
            </li>
            <li>
              <a
                href="/opportunities?experience=beginner"
                onClick={() => trackEvent({ eventType: 'opportunities_clicked_from_course' })}
              >
                <Compass size={16} strokeWidth={2} aria-hidden="true" />
                Explore recommended opportunities
              </a>
            </li>
            <li>
              <a href={`${LEARN_PATH.assessment}?retake=1`}>
                <RotateCcw size={16} strokeWidth={2} aria-hidden="true" />
                Retake assessment later
              </a>
            </li>
            <li>
              <a href={LEARN_PATH.course}>
                <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
                Back to course
              </a>
            </li>
            {certificateId ? (
              <li>
                <button type="button" onClick={() => void download()}>
                  <GraduationCap size={16} strokeWidth={2} aria-hidden="true" />
                  Download certificate
                </button>
              </li>
            ) : null}
          </ul>
          {paths.length ? <p className="learn-disclaimer">{OPPORTUNITIES_DISCLAIMER}</p> : null}
        </aside>
      </div>
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, score));
  const offset = circumference * (1 - clamped / 100);
  return (
    <div className="learn-score-ring" role="img" aria-label={`${score} out of 100`}>
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <defs>
          <linearGradient id="learn-score-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1687FF" />
            <stop offset="100%" stopColor="#8B2CF5" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#e8eef8" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="url(#learn-score-grad)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
        />
      </svg>
      <p className="learn-big-score">
        {score} <small>/ 100</small>
      </p>
    </div>
  );
}
