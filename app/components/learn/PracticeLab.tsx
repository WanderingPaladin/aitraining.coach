'use client';

import { useEffect, useMemo, useState } from 'react';
import scenarios from '../../../lib/learn/data/practical-scenarios.json';
import { trackEvent } from '../../../lib/tracking';
import CompareCard from './CompareCard';
import LearnShell from './LearnShell';

function labSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function PracticeLab({ labId }: { labId: string }) {
  const items = useMemo(
    () => scenarios.scenarios.filter((item) => labSlug(item.lab) === labId),
    [labId],
  );
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (items[0]) trackEvent({ eventType: 'practice_started', metadata: { lab: items[0].lab } });
  }, [items]);

  if (!items.length) {
    return (
      <LearnShell>
        <div className="journal-light">
          <div className="shell journal-main">
            <p className="learn-empty">That practice lab could not be found.</p>
          </div>
        </div>
      </LearnShell>
    );
  }

  return (
    <LearnShell>
      <div className="journal-light">
        <div className="shell journal-main">
          <p className="learn-kicker">
            <a href="/learn/ai-training-foundations/practice">Practice labs</a>
          </p>
          <h1>{items[0].lab}</h1>
          {items.map((item) => {
            if (item.responseA && item.responseB && (item.preferred === 'A' || item.preferred === 'B')) {
              return (
                <CompareCard
                  key={item.id}
                  prompt={item.prompt}
                  a={item.responseA.replace(/\\n/g, '\n')}
                  b={item.responseB.replace(/\\n/g, '\n')}
                  correct={item.preferred}
                  why={item.explanation}
                />
              );
            }
            return (
              <section key={item.id} className="learn-example">
                <p className="learn-prompt">{item.prompt}</p>
                <p className="learn-note">{item.explanation}</p>
                <ul className="learn-checklist">
                  {item.rubric.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </section>
            );
          })}
          <p>
            <button
              type="button"
              className="primary-button"
              onClick={() => {
                setDone(true);
                trackEvent({ eventType: 'practice_completed', metadata: { lab: items[0].lab } });
              }}
            >
              Mark lab complete
            </button>
          </p>
          {done ? <p className="learn-feedback is-ok" role="status">Saved. This does not change your assessment score.</p> : null}
        </div>
      </div>
    </LearnShell>
  );
}
