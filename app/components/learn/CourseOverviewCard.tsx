'use client';

import { Award, BookOpen, Clock3, FlaskConical } from 'lucide-react';
import { MODULES } from '../../../lib/learn/course';
import {
  completedModuleCount,
  courseMinutes,
  courseOverviewCopy,
  coursePhase,
  getCoursePrimaryAction,
  nextIncompleteModule,
  progressPercent,
} from '../../../lib/learn/overview';
import { type LocalLearnState } from '../../../lib/learn/storage';
import { useLearnProgress } from '../../hooks/useLearnProgress';

export default function CourseOverviewCard(props: {
  curriculumHref?: string;
  headingLevel?: 'h1' | 'h2';
}) {
  const { state, ready } = useLearnProgress();
  return <CourseOverviewView state={state} ready={ready} {...props} />;
}

export function CourseOverviewView({
  state,
  ready,
  curriculumHref = '/learn#curriculum',
  headingLevel = 'h2',
}: {
  state: LocalLearnState;
  ready: boolean;
  curriculumHref?: string;
  headingLevel?: 'h1' | 'h2';
}) {
  const copy = courseOverviewCopy();
  const percent = progressPercent(state);
  const completed = completedModuleCount(state);
  const total = MODULES.length;
  const phase = coursePhase(state);
  const action = getCoursePrimaryAction(state);
  const nextModule = nextIncompleteModule(state);
  const Title = headingLevel;
  const showProgress = phase !== 'not_started';
  const showNextUp =
    (phase === 'in_progress' && nextModule) ||
    phase === 'assessment_ready' ||
    phase === 'assessment_in_progress';

  const secondary =
    phase === 'passed' || phase === 'failed'
      ? { href: '/learn/ai-training-foundations', label: 'Review course' }
      : { href: curriculumHref, label: 'View curriculum' };

  return (
    <article className="learn-overview-card">
      <div className={`learn-overview-main${showNextUp ? ' has-next' : ''}`}>
        <header className="learn-overview-head">
          <p className="learn-overview-eyebrow">{copy.eyebrow}</p>
          <span className="learn-overview-badge">{copy.badge}</span>
        </header>
        <Title className="learn-overview-title">{copy.title}</Title>
        <p className="learn-overview-desc">{copy.description}</p>
        <ul className="learn-overview-meta">
          <li>
            <BookOpen size={16} strokeWidth={2} aria-hidden="true" />
            {total} modules
          </li>
          <li>
            <Clock3 size={16} strokeWidth={2} aria-hidden="true" />
            ~{courseMinutes()} min
          </li>
          <li>
            <FlaskConical size={16} strokeWidth={2} aria-hidden="true" />
            Practice
          </li>
          <li>
            <Award size={16} strokeWidth={2} aria-hidden="true" />
            Certificate
          </li>
        </ul>
        {showProgress ? (
          <div className="learn-overview-progress">
            <div className="learn-overview-progress-row">
              <p>{phase === 'passed' ? 'Course complete' : 'Your progress'}</p>
              <b>{percent}%</b>
            </div>
            <div
              className="learn-meter"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percent}
              aria-label={`${percent} percent complete`}
            >
              <i style={{ width: `${percent}%` }} />
            </div>
            <p className="learn-overview-count">
              {completed} of {total} modules completed
            </p>
          </div>
        ) : null}
        <div className="learn-overview-actions">
          {ready ? (
            <a className="primary-button" href={action.href}>
              {action.label}
            </a>
          ) : (
            <span className="primary-button is-disabled">Loading…</span>
          )}
          <a className="learn-overview-secondary" href={secondary.href}>
            {secondary.label}
          </a>
        </div>
      </div>
      {showNextUp ? (
        <aside className="learn-overview-next">
          <p className="learn-overview-eyebrow">Next up</p>
          {phase === 'assessment_ready' || phase === 'assessment_in_progress' ? (
            <>
              <h3>Final Readiness Assessment</h3>
              <p>~20–25 min</p>
            </>
          ) : nextModule ? (
            <>
              <p className="learn-overview-next-kicker">Module {nextModule.n}</p>
              <h3>{nextModule.title}</h3>
              <p>{nextModule.minutes}</p>
            </>
          ) : null}
        </aside>
      ) : null}
      <p className="learn-overview-disclaimer">{copy.disclaimer}</p>
    </article>
  );
}
