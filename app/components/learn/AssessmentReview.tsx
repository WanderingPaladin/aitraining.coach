'use client';

import { Check } from 'lucide-react';
import type { PublicQuestion } from '../../../lib/learn/api';
import { usStates } from '../../../lib/apply-fields';
import { LEARN_PATH } from '../../../lib/learn/course';
import { QuestionNavigator } from './AssessmentSidebar';

const SITUATIONS = [
  { id: 'completely_new', label: 'I’m completely new' },
  { id: 'accounts_no_work', label: 'I created accounts but haven’t gotten work' },
  { id: 'assessments_little_work', label: 'I passed assessments but have little/no work' },
  { id: 'already_working', label: 'I’m already completing AI-training work' },
  { id: 'researching', label: 'I’m just researching' },
];

export type AssessmentLead = {
  firstName: string;
  lastName: string;
  email: string;
  usBased: '' | 'yes' | 'no';
  situation: string;
  state: string;
  shareScore: boolean;
};

export function AssessmentReview({
  questions,
  answers,
  flagged,
  onJump,
  onContinue,
  onSubmit,
}: {
  questions: PublicQuestion[];
  answers: Record<string, string>;
  flagged: string[];
  onJump: (index: number) => void;
  onContinue: () => void;
  onSubmit: () => void;
}) {
  const answered = questions.filter((item) => Boolean(answers[item.id]?.trim())).length;
  const unanswered = questions.length - answered;
  const flaggedCount = questions.filter((item) => flagged.includes(item.id)).length;

  return (
    <div className="learn-assess-review">
      <p className="learn-kicker">Final Assessment</p>
      <h1>Ready to submit?</h1>
      <p className="learn-lead">
        {questions.length} questions. You can still go back and change answers before you submit.
      </p>
      <ul className="learn-assess-side-stats learn-assess-review-stats">
        <li>{answered} answered</li>
        <li>{unanswered} unanswered</li>
        <li>{flaggedCount} flagged</li>
      </ul>
      <QuestionNavigator
        questions={questions}
        current={-1}
        answers={answers}
        flagged={flagged}
        onJump={onJump}
      />
      <div className="learn-pager">
        <button type="button" className="secondary-button on-light" onClick={onContinue}>
          Continue Reviewing
        </button>
        <button type="button" className="primary-button" onClick={onSubmit}>
          Submit Assessment
        </button>
      </div>
    </div>
  );
}

export function AssessmentIdentityForm({
  lead,
  setLead,
  questions,
  answers,
  flagged,
  error,
  submitting,
  onBack,
  onSubmit,
}: {
  lead: AssessmentLead;
  setLead: (next: AssessmentLead) => void;
  questions: PublicQuestion[];
  answers: Record<string, string>;
  flagged: string[];
  error: string;
  submitting: boolean;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const ready =
    lead.firstName.trim() &&
    lead.email.includes('@') &&
    (lead.usBased === 'yes' || lead.usBased === 'no') &&
    lead.situation;
  const answered = questions.filter((item) => Boolean(answers[item.id]?.trim())).length;

  return (
    <div className="learn-assess-review">
      <p className="learn-kicker">Final Assessment</p>
      <h1>Before you submit</h1>
      <p className="learn-lead">
        You answered {answered} of {questions.length} questions
        {flagged.length ? ` · ${flagged.length} flagged` : ''}.
      </p>
      {lead.usBased === 'no' ? (
        <aside className="learn-callout is-note">
          <p>
            You can still complete this educational course. Current AITrainers.coach coaching and opportunity
            recommendations may be focused on U.S.-eligible users. This is not a citizenship check.
          </p>
        </aside>
      ) : null}
      <form
        className="learn-lead-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (ready && !submitting) onSubmit();
        }}
      >
        <label className="learn-honeypot" aria-hidden="true">
          Company website
          <input tabIndex={-1} autoComplete="off" name="companyWebsite" />
        </label>
        <label>
          First name
          <input
            value={lead.firstName}
            onChange={(event) => setLead({ ...lead, firstName: event.target.value })}
            required
            autoComplete="given-name"
          />
        </label>
        <label>
          Last name <span>(optional)</span>
          <input
            value={lead.lastName}
            onChange={(event) => setLead({ ...lead, lastName: event.target.value })}
            autoComplete="family-name"
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={lead.email}
            onChange={(event) => setLead({ ...lead, email: event.target.value })}
            required
            autoComplete="email"
          />
        </label>
        <fieldset>
          <legend>Are you currently based in the United States?</legend>
          <label className="learn-inline">
            <input
              type="radio"
              name="us"
              checked={lead.usBased === 'yes'}
              onChange={() => setLead({ ...lead, usBased: 'yes' })}
            />{' '}
            Yes
          </label>
          <label className="learn-inline">
            <input
              type="radio"
              name="us"
              checked={lead.usBased === 'no'}
              onChange={() => setLead({ ...lead, usBased: 'no' })}
            />{' '}
            No
          </label>
        </fieldset>
        <label>
          Current situation
          <select
            value={lead.situation}
            onChange={(event) => setLead({ ...lead, situation: event.target.value })}
            required
          >
            <option value="">Select one</option>
            {SITUATIONS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          State <span>(optional)</span>
          <select value={lead.state} onChange={(event) => setLead({ ...lead, state: event.target.value })}>
            <option value="">Select state</option>
            {usStates.map((state) => (
              <option key={state.code} value={state.code}>
                {state.name}
              </option>
            ))}
          </select>
        </label>
        <label className="learn-inline">
          <input
            type="checkbox"
            checked={lead.shareScore}
            onChange={(event) => setLead({ ...lead, shareScore: event.target.checked })}
          />
          Show my score on the public credential page
        </label>
        {error ? (
          <p className="learn-feedback is-no" role="alert">
            {error}
          </p>
        ) : null}
        <div className="learn-pager">
          <button type="button" className="secondary-button on-light" onClick={onBack} disabled={submitting}>
            Continue Reviewing
          </button>
          <button type="submit" className="primary-button" disabled={!ready || submitting}>
            {submitting ? 'Submitting assessment…' : 'Submit Assessment'}
          </button>
        </div>
      </form>
    </div>
  );
}

export function AssessmentComplete({ href }: { href: string }) {
  return (
    <div className="learn-empty-state learn-assess-complete">
      <p className="learn-kicker">Final Assessment</p>
      <h1>
        Assessment complete
        <Check size={22} strokeWidth={2.4} aria-hidden="true" />
      </h1>
      <p className="learn-lead">Your results are ready.</p>
      <div className="learn-pager">
        <a className="primary-button" href={href}>
          View My Results
        </a>
      </div>
    </div>
  );
}

export function AssessmentRetakeGate({ onStart }: { onStart: () => void }) {
  return (
    <div className="learn-empty-state learn-assess-retake">
      <p className="learn-kicker">Final Assessment</p>
      <h1>Retake Final Assessment</h1>
      <p className="learn-lead">You’re starting a new attempt. Your previous results stay available until you submit this one.</p>
      <div className="learn-pager">
        <button type="button" className="primary-button" onClick={onStart}>
          Start Retake
        </button>
        <a className="secondary-button on-light" href={LEARN_PATH.course}>
          Return to Course
        </a>
      </div>
    </div>
  );
}
