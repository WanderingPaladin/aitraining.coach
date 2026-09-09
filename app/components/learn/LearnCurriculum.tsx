'use client';

import { useState } from 'react';
import { CheckCircle2, ChevronDown, Circle, CircleDot } from 'lucide-react';
import { LEARN_PATH, MODULES } from '../../../lib/learn/course';
import { courseMinutes } from '../../../lib/learn/overview';
import { moduleStatus, type LocalLearnState } from '../../../lib/learn/storage';

export default function LearnCurriculum({ state, ready }: { state: LocalLearnState; ready: boolean }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="learn-section learn-curr-section" id="curriculum" aria-labelledby="learn-curr-title">
      <p className="learn-kicker">Curriculum</p>
      <h2 id="learn-curr-title">Build the core skills step by step.</h2>
      <p className="learn-lead">
        {MODULES.length} modules · ~{courseMinutes()} min
      </p>
      <ol className="learn-curr-list">
        {MODULES.map((item) => {
          const status = ready ? moduleStatus(state, item.n) : 'not_started';
          const expanded = open === item.n;
          const extra = item.outcomes.slice(1, 3);
          const cta = status === 'complete' ? 'Review' : status === 'in_progress' ? 'Continue' : 'Start';
          return (
            <li key={item.n} className={`learn-curr-row is-${status}${expanded ? ' is-open' : ''}`}>
              <div className="learn-curr-row-inner">
                <span className="learn-curr-num">{String(item.n).padStart(2, '0')}</span>
                <div className="learn-curr-copy">
                  <strong>{item.title}</strong>
                  <span className="learn-curr-meta">
                    {item.minutes} ·{' '}
                    <span className="learn-curr-status">
                      {status === 'complete' ? (
                        <CheckCircle2 size={14} strokeWidth={2} aria-hidden="true" />
                      ) : status === 'in_progress' ? (
                        <CircleDot size={14} strokeWidth={2} aria-hidden="true" />
                      ) : (
                        <Circle size={14} strokeWidth={2} aria-hidden="true" />
                      )}
                      {status === 'complete' ? 'Completed' : status === 'in_progress' ? 'In progress' : 'Not started'}
                    </span>
                  </span>
                  <span>{item.summary}</span>
                </div>
                <a className="learn-text-btn" href={LEARN_PATH.module(item.n)}>
                  {cta}
                </a>
                {extra.length ? (
                  <button
                    type="button"
                    className="learn-curr-more-btn"
                    aria-expanded={expanded}
                    aria-controls={`learn-module-${item.n}-detail`}
                    onClick={() => setOpen(expanded ? null : item.n)}
                  >
                    <span className="learn-sr">{expanded ? 'Hide' : 'Show'} more objectives</span>
                    <ChevronDown size={16} strokeWidth={2} aria-hidden="true" />
                  </button>
                ) : null}
              </div>
              {extra.length ? (
                <div className="learn-curr-detail" id={`learn-module-${item.n}-detail`} hidden={!expanded}>
                  <ul>
                    {extra.map((outcome) => (
                      <li key={outcome}>{outcome}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
