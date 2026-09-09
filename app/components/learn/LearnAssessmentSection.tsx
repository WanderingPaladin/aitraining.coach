'use client';

import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Award,
  ClipboardList,
  Focus,
  GitCompare,
  GraduationCap,
  Info,
  Layers,
  ListChecks,
  PenLine,
  SearchCheck,
} from 'lucide-react';
import { fetchAttempt, type AssessmentResult } from '../../../lib/learn/api';
import {
  ASSESSMENT_ITEM_COUNT,
  ASSESSMENT_WEIGHTS,
  LEARN_PATH,
  MODULES,
  PASS_SCORE,
} from '../../../lib/learn/course';
import { type CoursePhase, type CoursePrimaryAction } from '../../../lib/learn/overview';
import { practiceHrefForCategory } from '../../../lib/learn/results-display';
import { type LearningAction } from '../../../lib/learn/sequence';

const WEIGHT_COPY: Record<string, string> = {
  instruction_following: 'Follow explicit and implicit requirements accurately without adding or missing key details.',
  response_evaluation: 'Judge the overall quality, helpfulness, and safety of AI responses.',
  factuality: 'Identify unsupported claims, check accuracy, and recognize when stronger sources are needed.',
  written_reasoning: 'Explain judgments clearly, consistently, and with appropriate depth.',
  attention_to_detail: 'Catch smaller issues, contradictions, and constraint violations that others may miss.',
};

const WEIGHT_ICONS = {
  instruction_following: ListChecks,
  response_evaluation: GitCompare,
  factuality: SearchCheck,
  written_reasoning: PenLine,
  attention_to_detail: Focus,
} as const;

const WEIGHT_LABEL = ASSESSMENT_WEIGHTS.map(
  (item) => `${Math.round(item.weight * 100)}% ${item.label}`,
).join(', ');

const ASSESSMENT_DISCLAIMER =
  'This is an educational assessment. Your score does not guarantee employment, platform acceptance, project availability, or income.';

export default function LearnAssessmentSection({
  phase,
  ready,
  completed,
  courseAction,
  assess,
}: {
  phase: CoursePhase;
  ready: boolean;
  completed: number;
  courseAction: CoursePrimaryAction;
  assess: LearningAction;
}) {
  const resultId = assess.type === 'results' ? assess.id : null;
  const [latest, setLatest] = useState<AssessmentResult | null>(null);

  useEffect(() => {
    if (!resultId) {
      setLatest(null);
      return;
    }
    let active = true;
    fetchAttempt(resultId)
      .then((result) => {
        if (active && result.submitted) setLatest(result);
      })
      .catch(() => {
        if (active) setLatest(null);
      });
    return () => {
      active = false;
    };
  }, [resultId]);

  const certificateHref = latest?.certificate?.credentialId
    ? LEARN_PATH.certificate(latest.certificate.credentialId)
    : null;
  const continueAction = continueFor(phase, courseAction, assess, resultId, certificateHref);

  return (
    <section className="learn-section learn-assess-section" aria-labelledby="learn-assess-title">
      <header className="learn-assess-intro">
        <p className="learn-kicker">Final readiness assessment</p>
        <h2 id="learn-assess-title">See what you’re ready for — and what to improve.</h2>
        <p className="learn-lead">
          The final assessment brings together everything you’ve learned in this course. It measures five core
          evaluation skills using the weighting below.
        </p>
        <p className="learn-assess-strip">
          <ClipboardList size={16} strokeWidth={2} aria-hidden="true" />
          {ASSESSMENT_ITEM_COUNT} questions · 5 skill areas · {PASS_SCORE}/100 to earn your certificate
        </p>
        <p className="learn-disclaimer">{ASSESSMENT_DISCLAIMER}</p>
      </header>

      <div className="learn-assess-split">
        <article className="learn-weight-card">
          <div className="learn-weight-card-head">
            <h3>
              How your score is built
              <Info size={16} strokeWidth={2} aria-hidden="true" />
            </h3>
            <span className="learn-weight-total">Total: 100%</span>
          </div>
          <p className="learn-hint">
            These percentages show the assessment weighting for each skill area — not your current score.
          </p>
          <div className="learn-weight-bar" role="img" aria-label={`Assessment score weights: ${WEIGHT_LABEL}`}>
            {ASSESSMENT_WEIGHTS.map((item) => (
              <span key={item.key} style={{ flexGrow: item.weight * 100 }}>
                <em>{Math.round(item.weight * 100)}%</em>
              </span>
            ))}
          </div>
          <ul className="learn-weight-legend">
            {ASSESSMENT_WEIGHTS.map((item) => (
              <li key={item.key}>
                <i aria-hidden="true" />
                <span>
                  {Math.round(item.weight * 100)}% {item.label}
                </span>
              </li>
            ))}
          </ul>
        </article>

        <aside className="learn-assess-status">
          {!ready ? (
            <>
              <span className="learn-skel learn-skel-title" />
              <span className="learn-skel learn-skel-copy" />
              <span className="learn-skel learn-skel-btn" />
            </>
          ) : (
            <StatusCard
              phase={phase}
              completed={completed}
              courseAction={courseAction}
              assess={assess}
              resultId={resultId}
              certificateHref={certificateHref}
              score={latest?.finalScore}
              stage={latest?.levelCopy?.title}
            />
          )}
        </aside>
      </div>

      <div className="learn-assess-skills-wrap">
        <h3>The five skill areas</h3>
        <p className="learn-lead">Here’s what each area measures and how it contributes to your final score.</p>
        <ul className="learn-assess-skills">
          {ASSESSMENT_WEIGHTS.map((item) => {
            const Icon = WEIGHT_ICONS[item.key];
            return (
              <li key={item.key}>
                <div className="learn-assess-skill-top">
                  <span className="learn-assess-skill-icon" aria-hidden="true">
                    <Icon size={18} strokeWidth={2} />
                  </span>
                  <span className="learn-weight-total">{Math.round(item.weight * 100)}%</span>
                </div>
                <h4>{item.label}</h4>
                <p>{WEIGHT_COPY[item.key]}</p>
                <a
                  className="learn-text-btn"
                  href={practiceHrefForCategory(item.key)}
                  aria-label={`Learn more about ${item.label}`}
                >
                  Learn more
                  <ArrowRight size={14} strokeWidth={2} aria-hidden="true" />
                </a>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="learn-assess-continue">
        <div>
          <GraduationCap size={22} strokeWidth={2} aria-hidden="true" />
          <div>
            <h3>Ready to put your skills to the test?</h3>
            <p>Complete the course modules, practice in the labs, then take the final assessment to see how you’re doing.</p>
          </div>
        </div>
        {ready ? (
          <a className="learn-text-btn" href={continueAction.href}>
            {continueAction.label}
            <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
          </a>
        ) : (
          <span className="learn-skel learn-skel-btn" aria-hidden="true" />
        )}
      </div>
    </section>
  );
}

function StatusCard({
  phase,
  completed,
  courseAction,
  assess,
  resultId,
  certificateHref,
  score,
  stage,
}: {
  phase: CoursePhase;
  completed: number;
  courseAction: CoursePrimaryAction;
  assess: LearningAction;
  resultId: string | null;
  certificateHref: string | null;
  score?: number;
  stage?: string;
}) {
  if (phase === 'passed') {
    return (
      <>
        <p className="learn-kicker">Your assessment</p>
        <h3>Certificate unlocked</h3>
        {score != null ? (
          <p className="learn-assess-score">
            {score} <small>/ 100</small>
          </p>
        ) : null}
        {stage ? <p className="learn-assess-stage">{stage}</p> : null}
        <a className="primary-button" href={certificateHref ?? assess.href}>
          View certificate
          <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
        </a>
        {certificateHref && resultId ? (
          <a className="learn-text-btn" href={LEARN_PATH.results(resultId)}>
            View results
          </a>
        ) : null}
      </>
    );
  }
  if (phase === 'failed') {
    return (
      <>
        <p className="learn-kicker">Your assessment</p>
        <h3>Your latest result</h3>
        {score != null ? (
          <p className="learn-assess-score">
            {score} <small>/ 100</small>
          </p>
        ) : null}
        {stage ? <p className="learn-assess-stage">{stage}</p> : null}
        <a className="primary-button" href={assess.href}>
          View results
          <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
        </a>
        <a className="learn-text-btn" href={`${LEARN_PATH.assessment}?retake=1`}>
          Retake assessment
        </a>
      </>
    );
  }
  if (phase === 'assessment_ready' || phase === 'assessment_in_progress') {
    return (
      <>
        <p className="learn-kicker">Your assessment</p>
        <h3>{phase === 'assessment_in_progress' ? 'Assessment in progress' : 'Ready to take the assessment?'}</h3>
        <p>Complete the final assessment to see how the five evaluation skills come together.</p>
        <ul className="learn-assess-facts">
          <li>
            <ClipboardList size={16} strokeWidth={2} aria-hidden="true" />
            {ASSESSMENT_ITEM_COUNT} questions
          </li>
          <li>
            <Layers size={16} strokeWidth={2} aria-hidden="true" />
            Covers all 5 skill areas
          </li>
          <li>
            <Award size={16} strokeWidth={2} aria-hidden="true" />
            {PASS_SCORE}/100 required for certificate
          </li>
        </ul>
        <a className="primary-button" href={assess.href}>
          {phase === 'assessment_in_progress' ? 'Continue assessment' : 'Start assessment'}
          <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
        </a>
        <p className="learn-assess-or">or</p>
        <a className="secondary-button on-light" href={LEARN_PATH.practice}>
          Review practice labs first
        </a>
      </>
    );
  }
  return (
    <>
      <p className="learn-kicker">Your assessment</p>
      <h3>Complete the course to unlock</h3>
      <p>Finish the required modules before the final assessment opens.</p>
      <p className="learn-assess-progress">
        {completed} / {MODULES.length} modules complete
      </p>
      <a className="primary-button" href={courseAction.href}>
        Continue learning
        <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
      </a>
      <a className="learn-text-btn" href={LEARN_PATH.practice}>
        Review practice labs
      </a>
    </>
  );
}

function continueFor(
  phase: CoursePhase,
  courseAction: CoursePrimaryAction,
  assess: LearningAction,
  resultId: string | null,
  certificateHref: string | null,
) {
  if (phase === 'passed') return { href: certificateHref ?? assess.href, label: 'View certificate' };
  if (phase === 'failed' && resultId) return { href: LEARN_PATH.results(resultId), label: 'View results' };
  if (phase === 'assessment_ready' || phase === 'assessment_in_progress') {
    return {
      href: assess.href,
      label: phase === 'assessment_in_progress' ? 'Continue assessment' : 'Start assessment',
    };
  }
  return { href: courseAction.href, label: 'Continue learning' };
}
