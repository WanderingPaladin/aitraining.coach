'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { fetchAttempt, type AssessmentResult } from '../../../lib/learn/api';
import { ASSESSMENT_WEIGHTS, LEARN_PATH, MODULES, PASS_SCORE } from '../../../lib/learn/course';
import { type CoursePhase, type CoursePrimaryAction } from '../../../lib/learn/overview';
import { type LearningAction } from '../../../lib/learn/sequence';

const WEIGHT_COPY: Record<string, string> = {
  instruction_following: 'Follow explicit requirements accurately.',
  response_evaluation: 'Judge response quality systematically.',
  factuality: 'Identify unsupported or inaccurate claims.',
  written_reasoning: 'Explain judgments clearly.',
  attention_to_detail: 'Catch smaller constraints and inconsistencies.',
};

const WEIGHT_LABEL = ASSESSMENT_WEIGHTS.map(
  (item) => `${Math.round(item.weight * 100)}% ${item.label}`,
).join(', ');

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

  const unlocked = phase === 'assessment_ready' || phase === 'assessment_in_progress';
  const completedAttempt = phase === 'failed' || phase === 'passed';
  const score = latest?.finalScore;
  const stage = latest?.levelCopy?.title;

  return (
    <section className="learn-section learn-assess-section" aria-labelledby="learn-assess-title">
      <div className="learn-assess-main">
        <p className="learn-kicker">Final readiness assessment</p>
        <h2 id="learn-assess-title">See what you’ve learned — and where to focus next.</h2>
        <p className="learn-lead">
          Complete the final assessment after the course to measure the core evaluation skills you’ve practiced.
        </p>
        <p className="learn-weight-label">How your score is built</p>
        <p className="learn-hint">These percentages are assessment weights, not your current scores.</p>
        <div
          className="learn-weight-bar"
          role="img"
          aria-label={`Assessment score weights: ${WEIGHT_LABEL}`}
        >
          {ASSESSMENT_WEIGHTS.map((item) => (
            <span key={item.key} style={{ flexGrow: item.weight * 100 }} title={`${item.label} ${Math.round(item.weight * 100)}%`} />
          ))}
        </div>
        <ul className="learn-weight-legend">
          {ASSESSMENT_WEIGHTS.map((item) => (
            <li key={item.key}>
              <b>{Math.round(item.weight * 100)}%</b>
              <div>
                <strong>{item.label}</strong>
                <span>{WEIGHT_COPY[item.key]}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <aside className="learn-assess-status">
        <p className="learn-kicker">Your assessment</p>
        {!ready ? (
          <>
            <span className="learn-skel learn-skel-title" />
            <span className="learn-skel learn-skel-copy" />
            <span className="learn-skel learn-skel-btn" />
          </>
        ) : completedAttempt ? (
          <>
            <h3>{phase === 'passed' ? 'Assessment complete' : 'Latest assessment'}</h3>
            {score != null ? (
              <p className="learn-assess-score">
                {score} <small>/ 100</small>
              </p>
            ) : null}
            {stage ? <p className="learn-assess-stage">{stage}</p> : null}
            {phase === 'passed' ? <p className="learn-assess-unlock">Certificate unlocked</p> : null}
            <a className="primary-button" href={assess.href}>
              {phase === 'passed' ? 'View certificate' : 'View my results'}
              <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
            </a>
            {phase === 'passed' && resultId ? (
              <a className="learn-text-btn" href={LEARN_PATH.results(resultId)}>
                View results
              </a>
            ) : (
              <a className="learn-text-btn" href={`${LEARN_PATH.assessment}?retake=1`}>
                Retake assessment
              </a>
            )}
          </>
        ) : unlocked ? (
          <>
            <h3>{phase === 'assessment_in_progress' ? 'Assessment in progress' : "You're ready for the assessment"}</h3>
            <ul className="learn-assess-meta">
              <li>Core evaluation skills</li>
              <li>Certificate requirement: {PASS_SCORE}/100</li>
            </ul>
            <a className="primary-button" href={assess.href}>
              {phase === 'assessment_in_progress' ? 'Continue assessment' : 'Start assessment'}
              <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
            </a>
          </>
        ) : (
          <>
            <h3>Final assessment</h3>
            <p>Complete the required course modules to unlock your assessment.</p>
            <p className="learn-assess-progress">
              Progress: {completed} / {MODULES.length} modules complete
            </p>
            <a className="primary-button" href={courseAction.href}>
              {phase === 'not_started' ? 'Start course' : 'Continue course'}
              <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
            </a>
          </>
        )}
      </aside>
    </section>
  );
}
