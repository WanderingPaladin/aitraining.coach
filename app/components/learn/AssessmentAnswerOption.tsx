'use client';

import { Check } from 'lucide-react';
import type { DisplayOption, OptionLayout } from '../../../lib/learn/assessment-options';

export default function AssessmentAnswerOption({
  option,
  layout,
  name,
  selected,
  disabled,
  onSelect,
}: {
  option: DisplayOption;
  layout: OptionLayout;
  name: string;
  selected: boolean;
  disabled?: boolean;
  onSelect: (value: string) => void;
}) {
  const className = [
    'learn-answer',
    `is-${layout}`,
    selected ? 'is-selected' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <label className={className}>
      <input
        className="sr-only"
        type="radio"
        name={name}
        value={option.internalValue}
        checked={selected}
        disabled={disabled}
        onChange={() => onSelect(option.internalValue)}
      />
      {option.optionCode ? (
        <span className="learn-answer-code" aria-hidden="true">
          {option.optionCode}
        </span>
      ) : null}
      <span className="learn-answer-copy">{option.displayText}</span>
      {layout === 'binary' ? (
        selected ? <Check className="learn-answer-check" size={18} strokeWidth={2.4} aria-hidden="true" /> : null
      ) : (
        <span className="learn-answer-radio" aria-hidden="true" />
      )}
    </label>
  );
}
