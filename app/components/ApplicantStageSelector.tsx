'use client';

import type { ComponentType } from 'react';
import { Check, Clock3, Rocket, TrendingUp } from 'lucide-react';
import {
  type ApplicantStage,
  isValidApplicantStage,
} from '../../lib/apply-fields';

type StageOption = {
  value: ApplicantStage;
  title: string;
  description: string;
  icon: ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
};

const STAGE_OPTIONS: StageOption[] = [
  {
    value: 'new_no_account',
    title: "I'm new and don't have an account yet",
    description: 'I want to get started with AI training and need guidance from the beginning.',
    icon: Rocket,
  },
  {
    value: 'has_accounts_no_time',
    title: "I have accounts, but I don't have enough time",
    description: "I've joined AI-training platforms but need help managing the work and making consistent progress.",
    icon: Clock3,
  },
  {
    value: 'working_no_progress',
    title: "I'm already working, but I'm not seeing enough progress",
    description: "I'm completing AI-training work but want to improve my performance, consistency, and results.",
    icon: TrendingUp,
  },
];

type ApplicantStageSelectorProps = {
  value: ApplicantStage | '';
  error?: string;
  onChange: (value: ApplicantStage) => void;
};

function ApplicantStageFollowUp({ stage }: { stage: ApplicantStage | '' }) {
  if (!isValidApplicantStage(stage)) {
    return null;
  }

  switch (stage) {
    case 'new_no_account':
    case 'has_accounts_no_time':
    case 'working_no_progress':
      return null;
    default:
      return null;
  }
}

export default function ApplicantStageSelector({
  value,
  error,
  onChange,
}: ApplicantStageSelectorProps) {
  const errorId = 'applicant-stage-error';

  return (
    <fieldset
      className={`applicant-stage${error ? ' has-error' : ''}`}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? errorId : undefined}
    >
      <legend>
        Which best describes where you are right now?
        <span>Choose the option that most closely matches your current AI-training situation.</span>
      </legend>

      <div className="applicant-stage-grid" role="presentation">
        {STAGE_OPTIONS.map((option) => {
          const selected = value === option.value;
          const Icon = option.icon;
          return (
            <label
              key={option.value}
              className={selected ? 'applicant-stage-card is-selected' : 'applicant-stage-card'}
            >
              <input
                type="radio"
                name="applicant_stage"
                value={option.value}
                checked={selected}
                required
                onChange={() => onChange(option.value)}
              />
              {selected ? (
                <Check className="applicant-stage-check" size={14} strokeWidth={2.4} aria-hidden="true" />
              ) : null}
              <span className="applicant-stage-dot" aria-hidden="true" />
              <Icon className="applicant-stage-icon" size={20} strokeWidth={2} />
              <span className="applicant-stage-copy">
                <strong>{option.title}</strong>
                <small>{option.description}</small>
              </span>
            </label>
          );
        })}
      </div>

      <ApplicantStageFollowUp stage={value} />

      {error ? (
        <span id={errorId} className="apply-field-error">
          {error}
        </span>
      ) : null}
    </fieldset>
  );
}
