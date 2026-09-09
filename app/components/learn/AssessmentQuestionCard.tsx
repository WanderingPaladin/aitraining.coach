'use client';

import type { PublicQuestion } from '../../../lib/learn/api';
import { questionCategoryLabel } from '../../../lib/learn/question-category';

export default function AssessmentQuestionCard({
  question,
  number,
  total,
  value,
  disabled,
  onAnswer,
}: {
  question: PublicQuestion;
  number: number;
  total: number;
  value: string;
  disabled?: boolean;
  onAnswer: (value: string) => void;
}) {
  const category = questionCategoryLabel(question.id);
  const groupName = `assessment-${question.id}`;

  return (
    <section className="learn-question learn-assess-card" aria-labelledby="learn-question-heading">
      <div className="learn-assess-card-meta">
        <p className="learn-prompt-label">Question {String(number).padStart(2, '0')}</p>
        {category ? <span className="learn-overview-badge">{category}</span> : null}
      </div>
      {question.stimulus ? <pre className="learn-response">{question.stimulus}</pre> : null}
      <h2 id="learn-question-heading" tabIndex={-1}>
        {question.prompt}
      </h2>
      {question.helper ? <p className="learn-hint">{question.helper}</p> : null}
      {question.type === 'written' ? (
        <label>
          <span className="sr-only">Your answer</span>
          <textarea
            value={value}
            placeholder={question.placeholder ?? 'Write a short justification'}
            rows={6}
            disabled={disabled}
            onChange={(event) => onAnswer(event.target.value)}
          />
        </label>
      ) : (
        <div className="learn-option-list" role="radiogroup" aria-label={question.prompt}>
          {(question.options ?? []).map((option) => {
            const selected = value === option.id;
            const title = question.type === 'compare' ? `Response ${option.id}` : option.id;
            return (
              <label key={option.id} className={selected ? 'learn-answer is-selected' : 'learn-answer'}>
                <input
                  className="sr-only"
                  type="radio"
                  name={groupName}
                  value={option.id}
                  checked={selected}
                  disabled={disabled}
                  onChange={() => onAnswer(option.id)}
                />
                <span className="learn-answer-radio" aria-hidden="true" />
                <span className="learn-answer-copy">
                  <strong>{title}</strong>
                  {option.label && option.label !== option.id ? <span>{option.label}</span> : null}
                </span>
              </label>
            );
          })}
        </div>
      )}
      <p className="sr-only">
        Question {number} of {total}
      </p>
    </section>
  );
}
