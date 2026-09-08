'use client';

import { useState } from 'react';
import { pressProps } from '../../../lib/press';

export default function QuizCard({
  id,
  question,
  options,
  correct,
  explanation,
  selected,
  onAnswer,
  kicker = 'Quick check',
}: {
  id: string;
  question: string;
  options: Array<{ id: string; label: string }>;
  correct: string;
  explanation: string;
  selected?: string | boolean | null;
  onAnswer: (id: string, ok: boolean) => void;
  kicker?: string;
}) {
  const choice = typeof selected === 'string' ? selected : null;
  const [picked, setPicked] = useState<string | null>(choice);
  const current = picked ?? choice;
  const revealed = Boolean(current);

  return (
    <section className="learn-quiz" aria-labelledby={`${id}-q`}>
      {kicker ? <p className="learn-kicker">{kicker}</p> : null}
      <h3 id={`${id}-q`}>{question}</h3>
      <div className="learn-option-list" role="group" aria-label={question}>
        {options.map((option) => {
          const isPicked = current === option.id;
          const ok = option.id === correct;
          const className = [
            'learn-option',
            revealed && isPicked && ok ? 'is-correct' : '',
            revealed && isPicked && !ok ? 'is-wrong' : '',
            revealed && !isPicked && ok ? 'is-answer' : '',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <button
              key={option.id}
              type="button"
              className={className}
              aria-pressed={isPicked}
              disabled={revealed}
              {...pressProps(() => {
                if (revealed) return;
                setPicked(option.id);
                onAnswer(id, option.id === correct);
              })}
            >
              <span>{option.id}</span>
              {option.label}
            </button>
          );
        })}
      </div>
      {revealed ? (
        <p className={`learn-feedback ${current === correct ? 'is-ok' : 'is-no'}`} role="status">
          {current === correct ? 'Correct. ' : 'Not quite. '}
          {explanation}
        </p>
      ) : null}
    </section>
  );
}
