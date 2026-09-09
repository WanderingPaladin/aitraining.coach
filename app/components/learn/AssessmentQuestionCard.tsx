'use client';

import type { PublicQuestion } from '../../../lib/learn/api';
import { displayOption, optionLayout } from '../../../lib/learn/assessment-options';
import { questionCategoryLabel } from '../../../lib/learn/question-category';
import AssessmentAnswerOption from './AssessmentAnswerOption';

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
  const options = (question.options ?? []).map(displayOption);
  const layout = optionLayout(question, options);

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
        <div className={`learn-option-list is-${layout}`} role="radiogroup" aria-label={question.prompt}>
          {options.map((option) => (
            <AssessmentAnswerOption
              key={option.internalValue}
              option={option}
              layout={layout}
              name={groupName}
              selected={value === option.internalValue}
              disabled={disabled}
              onSelect={onAnswer}
            />
          ))}
        </div>
      )}
      <p className="sr-only">
        Question {number} of {total}
      </p>
    </section>
  );
}
