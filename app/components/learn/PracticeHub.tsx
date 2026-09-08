'use client';

import { useEffect } from 'react';
import { LEARN_PATH } from '../../../lib/learn/course';
import { practiceLabs } from '../../../lib/learn/sequence';
import { isLabComplete } from '../../../lib/learn/storage';
import { trackEvent } from '../../../lib/tracking';
import { useLearnProgress } from '../../hooks/useLearnProgress';
import LearnShell from './LearnShell';

const labs = practiceLabs();

export default function PracticeHub() {
  const { state, ready } = useLearnProgress();

  useEffect(() => {
    trackEvent({ eventType: 'practice_started', metadata: { lab: 'hub' } });
  }, []);

  return (
    <LearnShell>
      <div className="journal-light">
        <div className="shell journal-main">
          <p className="learn-kicker">
            <a href={LEARN_PATH.course}>AI Training Foundations</a>
            {' / '}
            Practice Labs
          </p>
          <h1>Practice labs</h1>
          <p className="learn-lead">
            Optional labs. They do not affect your certificate score. Instant explanations appear after you answer.
          </p>
          <ol className="learn-module-list">
            {labs.map((item) => {
              const done = ready && isLabComplete(state, item.id);
              return (
                <li key={item.id} className={`learn-module-card${done ? ' is-complete' : ''}`}>
                  <div>
                    <h2>{item.title}</h2>
                    <p>{done ? 'Complete' : 'Optional practice'}</p>
                  </div>
                  <a className="secondary-button on-light" href={LEARN_PATH.lab(item.id)}>
                    {done ? 'Review' : 'Start'}
                  </a>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </LearnShell>
  );
}
