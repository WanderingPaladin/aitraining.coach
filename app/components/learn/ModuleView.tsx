'use client';

import { useEffect } from 'react';
import course from '../../../lib/learn/data/course-v2.json';
import { MODULES } from '../../../lib/learn/course';
import { progressPercent } from '../../../lib/learn/storage';
import { trackEvent } from '../../../lib/tracking';
import { useLearnProgress } from '../../hooks/useLearnProgress';
import LessonBlocks, { type V2QuickCheck, type V2Section } from './LessonBlocks';
import SaveToast from './SaveToast';

export default function ModuleView({ n }: { n: number }) {
  const lesson = course.modules.find((item) => item.id === n);
  const meta = MODULES.find((item) => item.n === n);
  const { state, update, saved, ready } = useLearnProgress();
  const prev = n > 1 ? n - 1 : null;
  const next = n < MODULES.length ? n + 1 : null;
  const percent = progressPercent(state);

  useEffect(() => {
    if (!lesson || !ready) return;
    const started = state.startedModules.includes(n) ? state.startedModules : [...state.startedModules, n];
    update({ startedModules: started, currentModule: n, lastLesson: String(n) });
    trackEvent({ eventType: 'module_started', metadata: { module: n } });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- start once progress has loaded
  }, [n, ready]);

  if (!lesson || !meta) {
    return <p className="learn-empty">That module could not be found.</p>;
  }

  function complete() {
    const completed = state.completedModules.includes(n) ? state.completedModules : [...state.completedModules, n];
    update({ completedModules: completed, currentModule: next ?? n });
    trackEvent({ eventType: 'module_completed', metadata: { module: n } });
  }

  return (
    <div className="learn-module-layout">
      <aside className="learn-sidenav" aria-label="Course modules">
        <p className="learn-kicker">AI Training Foundations</p>
        <ol>
          {MODULES.map((item) => (
            <li key={item.n}>
              <a
                href={`/learn/ai-training-foundations/module/${item.n}`}
                aria-current={item.n === n ? 'page' : undefined}
                aria-label={`Module ${item.n}: ${item.title}${state.completedModules.includes(item.n) ? ', complete' : ''}`}
                className={state.completedModules.includes(item.n) ? 'is-done' : undefined}
              >
                <span>{String(item.n).padStart(2, '0')}</span>
                {item.title}
              </a>
            </li>
          ))}
        </ol>
        <div
          className="learn-mini-progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-label={`${percent} percent complete`}
        >
          <b>{percent}% complete</b>
          <span className="learn-meter" aria-hidden="true"><i style={{ width: `${percent}%` }} /></span>
        </div>
        {state.completedModules.includes(3) ? (
          <a className="secondary-button on-light learn-sidenav-cta" href="/learn/ai-training-foundations/practice">
            Practice labs
          </a>
        ) : null}
      </aside>
      <article className="learn-lesson">
        <header className="learn-lesson-head">
          <p className="learn-kicker">
            <a href="/learn">Learn</a>
            {' / '}
            <a href="/learn/ai-training-foundations">AI Training Foundations</a>
            {' / '}
            Module {n} · {meta.minutes}
          </p>
          <h1>{meta.title}</h1>
        </header>
        <LessonBlocks
          sections={lesson.sections as V2Section[]}
          quickChecks={lesson.quickChecks as V2QuickCheck[]}
          quizResults={state.quizResults}
          onQuiz={(id, ok) => update({ quizResults: { ...state.quizResults, [id]: ok } })}
        />
        <nav className="learn-pager" aria-label="Module pagination">
          {prev ? (
            <a className="secondary-button on-light" href={`/learn/ai-training-foundations/module/${prev}`}>
              Previous
            </a>
          ) : (
            <a className="secondary-button on-light" href="/learn/ai-training-foundations">
              Course home
            </a>
          )}
          {next ? (
            <a className="primary-button" href={`/learn/ai-training-foundations/module/${next}`} onClick={complete}>
              Mark complete & continue
            </a>
          ) : (
            <a className="primary-button" href="/learn/ai-training-foundations/assessment" onClick={complete}>
              Take final assessment
            </a>
          )}
        </nav>
      </article>
      <SaveToast show={saved} />
    </div>
  );
}
