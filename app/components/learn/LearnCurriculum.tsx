'use client';

import { useState } from 'react';
import { CheckCircle2, ChevronDown, Circle, CircleDot } from 'lucide-react';
import { LEARN_PATH, MODULES } from '../../../lib/learn/course';
import { courseMinutes } from '../../../lib/learn/overview';
import { moduleStatus, type LocalLearnState } from '../../../lib/learn/storage';

export default function LearnCurriculum({ state, ready }: { state: LocalLearnState; ready: boolean }) {
  const [showAll, setShowAll] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const previewCount = 5;

  return (
    <section className="learn-section" id="curriculum" aria-labelledby="learn-curr-title">
      <p className="learn-kicker">Curriculum</p>
      <h2 id="learn-curr-title">Build the core skills step by step.</h2>
      <p className="learn-lead">
        {MODULES.length} modules · ~{courseMinutes()} min
      </p>
      <ol className={`learn-curr-list${showAll ? ' is-all' : ''}`}>
        {MODULES.map((item, index) => {
          const status = ready ? moduleStatus(state, item.n) : 'not_started';
          const hidden = !showAll && index >= previewCount;
          const expanded = open === item.n;
          const cta =
            status === 'complete' ? 'Review' : status === 'in_progress' ? 'Continue' : 'Start';
          return (
            <li
              key={item.n}
              className={`learn-curr-row is-${status}${hidden ? ' is-extra' : ''}${expanded ? ' is-open' : ''}`}
            >
              <button
                type="button"
                className="learn-curr-toggle"
                aria-expanded={expanded}
                aria-controls={`learn-module-${item.n}-detail`}
                onClick={() => setOpen(expanded ? null : item.n)}
              >
                <span className="learn-curr-num">{String(item.n).padStart(2, '0')}</span>
                <span className="learn-curr-copy">
                  <strong>{item.title}</strong>
                  <span>{item.summary}</span>
                </span>
                <span className="learn-curr-meta">
                  <span>{item.minutes}</span>
                  <span className="learn-curr-status">
                    {status === 'complete' ? (
                      <CheckCircle2 size={16} strokeWidth={2} aria-hidden="true" />
                    ) : status === 'in_progress' ? (
                      <CircleDot size={16} strokeWidth={2} aria-hidden="true" />
                    ) : (
                      <Circle size={16} strokeWidth={2} aria-hidden="true" />
                    )}
                    {status === 'complete' ? 'Completed' : status === 'in_progress' ? 'In progress' : 'Not started'}
                  </span>
                </span>
                <ChevronDown size={16} strokeWidth={2} aria-hidden="true" />
              </button>
              <div className="learn-curr-detail" id={`learn-module-${item.n}-detail`} hidden={!expanded}>
                <ul>
                  {item.outcomes.map((outcome) => (
                    <li key={outcome}>{outcome}</li>
                  ))}
                </ul>
                <a className="primary-button" href={LEARN_PATH.module(item.n)}>
                  {cta} →
                </a>
              </div>
            </li>
          );
        })}
      </ol>
      {MODULES.length > previewCount ? (
        <p className="learn-curr-more">
          <button type="button" className="learn-text-btn" onClick={() => setShowAll((value) => !value)}>
            {showAll ? 'Show fewer modules' : `View all ${MODULES.length} modules`}
            <ChevronDown size={16} strokeWidth={2} aria-hidden="true" className={showAll ? 'is-up' : undefined} />
          </button>
        </p>
      ) : null}
    </section>
  );
}
