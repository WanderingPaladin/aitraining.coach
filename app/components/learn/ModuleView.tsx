'use client';

import { useEffect } from 'react';
import { MODULES } from '../../../lib/learn/course';
import { MODULE_LESSONS } from '../../../lib/learn/content';
import { trackEvent } from '../../../lib/tracking';
import { useLearnProgress } from '../../hooks/useLearnProgress';
import LessonBlocks from './LessonBlocks';
import SaveToast from './SaveToast';

export default function ModuleView({ n }: { n: number }) {
  const lesson = MODULE_LESSONS.find((item) => item.n === n);
  const meta = MODULES.find((item) => item.n === n);
  const { state, update, saved, ready } = useLearnProgress();
  const prev = n > 1 ? n - 1 : null;
  const next = n < 6 ? n + 1 : null;

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
        <div className="learn-mini-progress" aria-label={`${state.completedModules.length} of 6 modules complete`}>
          <b>{Math.round((state.completedModules.length / 6) * 100)}% complete</b>
          <span className="learn-meter"><i style={{ width: `${(state.completedModules.length / 6) * 100}%` }} /></span>
        </div>
      </aside>
      <article className="learn-lesson">
        <header className="learn-lesson-head">
          <p className="learn-kicker">Module {n} · {meta.minutes}</p>
          <h1>{meta.title}</h1>
          <p className="learn-lead">{lesson.intro}</p>
        </header>
        <LessonBlocks
          blocks={lesson.blocks}
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
