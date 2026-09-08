'use client';

import { MODULES } from '../../../lib/learn/course';
import { moduleStatus } from '../../../lib/learn/storage';
import { trackEvent } from '../../../lib/tracking';
import { useLearnProgress } from '../../hooks/useLearnProgress';
import { CourseOverviewView } from './CourseOverviewCard';

export default function CourseDashboard() {
  const { state, ready } = useLearnProgress();
  if (!ready) return <p className="learn-status">Loading your progress…</p>;

  return (
    <div className="learn-dashboard">
      <CourseOverviewView state={state} ready={ready} headingLevel="h1" curriculumHref="#curriculum" />
      <ol className="learn-module-list" id="curriculum">
        {MODULES.map((item) => {
          const status = moduleStatus(state, item.n);
          const label = status === 'complete' ? 'Complete' : status === 'in_progress' ? 'In progress' : 'Not started';
          return (
            <li key={item.n} className={`learn-module-card is-${status}`}>
              <div>
                <span className="learn-module-num">{String(item.n).padStart(2, '0')}</span>
                <h2>{item.title}</h2>
                <p>{item.minutes}</p>
              </div>
              <div className="learn-module-meta">
                <span className="learn-status">{label}</span>
                <a className="secondary-button on-light" href={`/learn/ai-training-foundations/module/${item.n}`}>
                  {status === 'not_started' ? 'Start' : 'Continue'}
                </a>
              </div>
            </li>
          );
        })}
        <li className="learn-module-card">
          <div>
            <span className="learn-module-num">Labs</span>
            <h2>Practice labs</h2>
            <p>Optional · recommended after module 3</p>
          </div>
          <a className="secondary-button on-light" href="/learn/ai-training-foundations/practice">
            Open labs
          </a>
        </li>
        <li className={`learn-module-card ${state.completedModules.length >= 8 ? 'is-in_progress' : 'is-locked'}`}>
          <div>
            <span className="learn-module-num">Test</span>
            <h2>Final Assessment</h2>
            <p>~20–25 min · 24 questions + 2 practicals</p>
          </div>
          <div className="learn-module-meta">
            <span className="learn-status">
              {state.resultId ? 'Completed' : state.attemptId ? 'In progress' : state.completedModules.length >= 8 ? 'Ready' : 'Locked'}
            </span>
            {state.resultId ? (
              <a className="primary-button" href={`/learn/ai-training-foundations/results/${state.resultId}`}>
                {state.passed ? 'View certificate' : 'View results'}
              </a>
            ) : state.completedModules.length >= 8 || state.attemptId ? (
              <a className="primary-button" href="/learn/ai-training-foundations/assessment">
                {state.attemptId ? 'Continue assessment' : 'Start assessment'}
              </a>
            ) : (
              <span className="secondary-button on-light is-disabled">Locked</span>
            )}
            {state.resultId ? (
              <a className="secondary-button on-light" href="/learn/ai-training-foundations/assessment?retake=1">
                Retake assessment
              </a>
            ) : null}
          </div>
        </li>
        <li className={`learn-module-card ${state.passed && state.resultId ? 'is-complete' : 'is-locked'}`}>
          <div>
            <span className="learn-module-num">Cert</span>
            <h2>Certificate</h2>
            <p>Unlocked after passing the assessment</p>
          </div>
          <div className="learn-module-meta">
            <span className="learn-status">{state.passed ? 'Unlocked' : 'Locked'}</span>
            {state.passed && state.resultId ? (
              <a className="secondary-button on-light" href={`/learn/ai-training-foundations/results/${state.resultId}`}>
                Open
              </a>
            ) : state.resultId ? (
              <a className="secondary-button on-light" href={`/learn/ai-training-foundations/results/${state.resultId}`}>
                See results
              </a>
            ) : (
              <span className="secondary-button on-light is-disabled">Locked</span>
            )}
          </div>
        </li>
      </ol>
      {state.resultId ? (
        <aside className="learn-callout is-tip learn-coach-card">
          <strong>Want help with your results?</strong>
          <p>Talk with a coach about where you’re currently stuck and what your next practical steps could be.</p>
          <p>
            <a className="primary-button" href="/#apply" onClick={() => trackEvent({ eventType: 'coaching_clicked_from_results' })}>
              Review my results with a coach
            </a>
          </p>
        </aside>
      ) : null}
    </div>
  );
}
