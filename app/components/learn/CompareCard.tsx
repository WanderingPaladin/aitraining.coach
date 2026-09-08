'use client';

import { useState } from 'react';
import { pressProps } from '../../../lib/press';

export default function CompareCard({
  prompt,
  a,
  b,
  correct,
  why,
}: {
  prompt?: string;
  a: string;
  b: string;
  correct: 'A' | 'B';
  why: string;
}) {
  const [picked, setPicked] = useState<'A' | 'B' | null>(null);
  return (
    <section className="learn-compare">
      {prompt ? <p className="learn-prompt-label">Prompt</p> : null}
      {prompt ? <blockquote className="learn-prompt">{prompt}</blockquote> : null}
      <div className="learn-compare-grid">
        {(['A', 'B'] as const).map((key) => {
          const text = key === 'A' ? a : b;
          const selected = picked === key;
          const show = Boolean(picked);
          const ok = key === correct;
          return (
            <button
              key={key}
              type="button"
              className={`learn-compare-card${selected && ok ? ' is-correct' : ''}${selected && !ok ? ' is-wrong' : ''}${show && ok ? ' is-answer' : ''}`}
              disabled={Boolean(picked)}
              {...pressProps(() => setPicked(key))}
            >
              <strong>Response {key}</strong>
              <span>{text}</span>
            </button>
          );
        })}
      </div>
      {picked ? (
        <p className={`learn-feedback ${picked === correct ? 'is-ok' : 'is-no'}`} role="status">
          {picked === correct ? 'Correct. ' : `The stronger choice is Response ${correct}. `}
          {why}
        </p>
      ) : (
        <p className="learn-hint">Choose the stronger response.</p>
      )}
    </section>
  );
}
