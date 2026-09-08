'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { pressProps } from '../../../lib/press';
import { LEARN_PATH } from '../../../lib/learn/course';
import type { CoursePrimaryAction } from '../../../lib/learn/overview';

const SAMPLE = {
  prompt: 'Give me three inexpensive vegetarian dinner ideas.',
  a: '1. Chicken tacos\n2. Vegetable pasta\n3. Lentil soup',
  b: '1. Bean chili\n2. Vegetable pasta\n3. Lentil soup',
  correct: 'B' as const,
  why: 'The response is well formatted, but chicken violates the vegetarian requirement. A polished response can still fail the task.',
};

export default function LearnEvalPreview({ action }: { action: CoursePrimaryAction }) {
  const [choice, setChoice] = useState<'A' | 'B' | null>(null);
  const ok = choice === SAMPLE.correct;

  return (
    <section className="learn-section" aria-labelledby="learn-eval-title">
      <p className="learn-kicker">Try it yourself</p>
      <h2 id="learn-eval-title">Which response follows the instruction better?</h2>
      <div className="learn-eval">
        <blockquote className="learn-eval-prompt">
          <span>Prompt</span>
          {SAMPLE.prompt}
        </blockquote>
        <div className="learn-eval-grid" role="radiogroup" aria-label="Choose the stronger response">
          {(['A', 'B'] as const).map((key) => {
            const selected = choice === key;
            const correctChoice = choice != null && key === SAMPLE.correct;
            const wrongChoice = selected && !ok;
            return (
              <button
                key={key}
                type="button"
                className={`learn-eval-card${selected ? ' is-selected' : ''}${correctChoice ? ' is-correct' : ''}${wrongChoice ? ' is-wrong' : ''}`}
                aria-pressed={selected}
                {...pressProps(() => setChoice(key))}
              >
                <strong>Response {key}</strong>
                <span>{key === 'A' ? SAMPLE.a : SAMPLE.b}</span>
              </button>
            );
          })}
        </div>
        {choice ? (
          <div className={`learn-eval-result ${ok ? 'is-ok' : 'is-no'}`} role="status">
            <p>
              {ok ? (
                <>
                  <CheckCircle2 size={18} strokeWidth={2} aria-hidden="true" />
                  Correct
                </>
              ) : (
                <>Not quite — Response {SAMPLE.correct} is stronger.</>
              )}
            </p>
            <p>{SAMPLE.why}</p>
            <p>This is the type of judgment you’ll practice in the course.</p>
            <a className="primary-button" href={action.href}>
              {action.phase === 'not_started' ? 'Start learning' : action.label.replace(/\s*→$/, '')}
              <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
            </a>
          </div>
        ) : (
          <p className="learn-hint">Choose A or B to see the explanation.</p>
        )}
      </div>
    </section>
  );
}
