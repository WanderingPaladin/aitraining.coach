'use client';

import { useEffect } from 'react';
import scenarios from '../../../lib/learn/data/practical-scenarios.json';
import { trackEvent } from '../../../lib/tracking';
import LearnShell from './LearnShell';

function labSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const labs = [...new Map(scenarios.scenarios.map((item) => [item.lab, item])).values()];

export default function PracticeHub() {
  useEffect(() => {
    trackEvent({ eventType: 'practice_started', metadata: { lab: 'hub' } });
  }, []);

  return (
    <LearnShell>
      <div className="journal-light">
        <div className="shell journal-main">
          <p className="learn-kicker">
            <a href="/learn/ai-training-foundations">AI Training Foundations</a>
          </p>
          <h1>Practice labs</h1>
          <p className="learn-lead">
            Optional labs. They do not affect your certificate score. Instant explanations appear after you answer.
          </p>
          <ol className="learn-module-list">
            {labs.map((item) => (
              <li key={item.id} className="learn-module-card">
                <div>
                  <h2>{item.lab}</h2>
                  <p>{item.category.replace(/_/g, ' ')}</p>
                </div>
                <a className="secondary-button on-light" href={`/learn/ai-training-foundations/practice/${labSlug(item.lab)}`}>
                  Start
                </a>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </LearnShell>
  );
}
