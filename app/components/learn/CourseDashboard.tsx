'use client';

import { MODULES } from '../../../lib/learn/course';
import { continueHref, moduleStatus, progressPercent } from '../../../lib/learn/storage';
import { trackEvent } from '../../../lib/tracking';
import { useLearnProgress } from '../../hooks/useLearnProgress';

export default function CourseDashboard() {
  const { state, ready } = useLearnProgress();
  const percent = progressPercent(state);
  const href = continueHref(state);
  if (!ready) return <p className="learn-status">Loading your progress…</p>;

  return (
    <div className="learn-dashboard">
      <header className="learn-dash-head">
        <div>
          <p className="learn-kicker">Free beginner course</p>
          <h1>AI Training Foundations</h1>
          <p className="learn-lead">Your progress is saved automatically.</p>
        </div>
        <div className="learn-score-ring" style={{ ['--p' as string]: `${percent}%` }} aria-label={`${percent} percent complete`}>
          <strong>{percent}%</strong>
          <span>Complete</span>
        </div>
      </header>
      <p>
        <a className="primary-button" href={href}>
          Continue learning
        </a>
      </p>
      <ol className="learn-module-list">
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
        <li className={`learn-module-card ${state.completedModules.length >= 6 ? 'is-in_progress' : ''}`}>
          <div>
            <span className="learn-module-num">07</span>
            <h2>Final Assessment</h2>
            <p>15 min</p>
          </div>
          <div className="learn-module-meta">
            <span className="learn-status">{state.resultId ? 'Submitted' : 'Ready when modules are done'}</span>
            <a className="primary-button" href="/learn/ai-training-foundations/assessment">
              {state.resultId ? 'View assessment' : 'Start assessment'}
            </a>
          </div>
        </li>
        <li className={`learn-module-card ${state.resultId ? 'is-in_progress' : 'is-locked'}`}>
          <div>
            <span className="learn-module-num">08</span>
            <h2>Certificate</h2>
            <p>Unlocked after passing the assessment</p>
          </div>
          <div className="learn-module-meta">
            <span className="learn-status">{state.resultId ? 'See results' : 'Locked'}</span>
            {state.resultId ? (
              <a className="secondary-button on-light" href={`/learn/ai-training-foundations/results/${state.resultId}`}>
                Open
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
