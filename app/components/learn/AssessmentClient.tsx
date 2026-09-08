'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usStates } from '../../../lib/apply-fields';
import { ApiError } from '../../../lib/api';
import {
  saveAssessmentAnswers,
  startAssessment,
  submitAssessment,
  type PublicQuestion,
} from '../../../lib/learn/api';
import { learnErrorMessage } from '../../../lib/learn/errors';
import { readLearnState, writeLearnState } from '../../../lib/learn/storage';
import { trackEvent } from '../../../lib/tracking';
import { pressProps } from '../../../lib/press';

const SITUATIONS = [
  { id: 'completely_new', label: 'I’m completely new' },
  { id: 'accounts_no_work', label: 'I created accounts but haven’t gotten work' },
  { id: 'assessments_little_work', label: 'I passed assessments but have little/no work' },
  { id: 'already_working', label: 'I’m already completing AI-training work' },
  { id: 'researching', label: 'I’m just researching' },
];

export default function AssessmentClient() {
  const router = useRouter();
  const [questions, setQuestions] = useState<PublicQuestion[]>([]);
  const [attemptId, setAttemptId] = useState('');
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const submitLock = useRef(false);
  const [lead, setLead] = useState({
    firstName: '',
    lastName: '',
    email: '',
    usBased: '' as '' | 'yes' | 'no',
    situation: '',
    state: '',
    shareScore: true,
  });

  useEffect(() => {
    let active = true;
    const local = readLearnState();
    const retake = new URLSearchParams(window.location.search).get('retake') === '1';
    if (local.resultId && !retake) {
      router.replace(`/learn/ai-training-foundations/results/${local.resultId}`);
      return () => {
        active = false;
      };
    }
    if (local.completedModules.length < 8 && !local.attemptId && !retake) {
      setError('Complete all eight modules before starting the final assessment.');
      setLoading(false);
      return;
    }
    const existing = retake ? undefined : local.attemptId || undefined;
    startAssessment(existing, retake)
      .then((result) => {
        if (!active) return;
        if (result.attempt.submitted) {
          writeLearnState({
            resultId: result.attempt.id,
            attemptId: result.attempt.id,
            passed: Boolean(result.result?.passed),
          });
          router.replace(`/learn/ai-training-foundations/results/${result.attempt.id}`);
          return;
        }
        const restored = result.attempt.answers ?? {};
        setQuestions(result.questions);
        setAttemptId(result.attempt.id);
        setAnswers(restored);
        const firstOpen = result.questions.findIndex((item) => !String(restored[item.id] ?? '').trim());
        setIndex(firstOpen >= 0 ? firstOpen : 0);
        writeLearnState(
          retake
            ? { attemptId: result.attempt.id, resultId: null, passed: false }
            : { attemptId: result.attempt.id },
        );
        trackEvent({ eventType: 'assessment_started', metadata: { attemptId: result.attempt.id } });
      })
      .catch((err) => {
        if (active) setError(learnErrorMessage(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [router]);

  useEffect(() => {
    if (loading || confirming) return;
    document.getElementById('learn-question-heading')?.focus();
  }, [index, loading, confirming]);

  const question = questions[index];
  const answeredCount = useMemo(
    () => questions.filter((item) => Boolean(answers[item.id]?.trim())).length,
    [answers, questions],
  );

  function setAnswer(value: string) {
    if (!question || submitting) return;
    const next = { ...answers, [question.id]: value };
    setAnswers(next);
    if (!attemptId) return;
    void saveAssessmentAnswers(attemptId, next).catch((err) => {
      if (err instanceof ApiError && (err.code === 'ALREADY_SUBMITTED' || err.status === 409)) {
        writeLearnState({ resultId: attemptId, attemptId });
        router.replace(`/learn/ai-training-foundations/results/${attemptId}`);
      }
    });
  }

  async function submit() {
    if (!attemptId || submitLock.current) return;
    submitLock.current = true;
    setSubmitting(true);
    setError('');
    try {
      const honeypot = (document.querySelector('input[name="companyWebsite"]') as HTMLInputElement | null)?.value;
      const result = await submitAssessment(attemptId, {
        answers,
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
        usBased: lead.usBased === 'yes',
        situation: lead.situation,
        state: lead.state || undefined,
        shareScore: lead.shareScore,
        companyWebsite: honeypot || undefined,
      });
      writeLearnState({ resultId: result.attemptId, attemptId, passed: Boolean(result.passed) });
      trackEvent({
        eventType: result.passed ? 'assessment_passed' : 'assessment_failed',
        metadata: { score: result.finalScore ?? 0 },
      });
      if (!result.passed) trackEvent({ eventType: 'assessment_not_passed', metadata: { score: result.finalScore ?? 0 } });
      trackEvent({ eventType: 'assessment_submitted', metadata: { score: result.finalScore ?? 0 } });
      if (result.certificate) trackEvent({ eventType: 'certificate_generated' });
      router.push(`/learn/ai-training-foundations/results/${result.attemptId}`);
    } catch (err) {
      if (err instanceof ApiError && (err.code === 'ALREADY_SUBMITTED' || err.status === 409)) {
        writeLearnState({ resultId: attemptId, attemptId });
        router.replace(`/learn/ai-training-foundations/results/${attemptId}`);
        return;
      }
      setError(learnErrorMessage(err));
      submitLock.current = false;
      setSubmitting(false);
    }
  }

  if (loading) return <p className="learn-status">Preparing your assessment…</p>;
  if (error && !question) {
    return (
      <p className="learn-empty" role="alert">
        {error}{' '}
        <a href="/learn/ai-training-foundations">Back to course</a>
      </p>
    );
  }
  if (!question) return <p className="learn-empty">No questions available.</p>;

  if (confirming) {
    const ready =
      lead.firstName.trim() &&
      lead.email.includes('@') &&
      (lead.usBased === 'yes' || lead.usBased === 'no') &&
      lead.situation;
    return (
      <div className="learn-assessment">
        <h1>Before you submit</h1>
        <p className="learn-lead">You answered {answeredCount} of {questions.length} questions. You can still go back and change answers.</p>
        {lead.usBased === 'no' ? (
          <aside className="learn-callout is-note">
            <p>
              You can still complete this educational course. Current AITrainers.coach coaching and opportunity recommendations may be focused on U.S.-eligible users. This is not a citizenship check.
            </p>
          </aside>
        ) : null}
        <form
          className="learn-lead-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (ready && !submitting) void submit();
          }}
        >
          <label className="learn-honeypot" aria-hidden="true">
            Company website
            <input tabIndex={-1} autoComplete="off" name="companyWebsite" />
          </label>
          <label>
            First name
            <input value={lead.firstName} onChange={(event) => setLead({ ...lead, firstName: event.target.value })} required autoComplete="given-name" />
          </label>
          <label>
            Last name <span>(optional)</span>
            <input value={lead.lastName} onChange={(event) => setLead({ ...lead, lastName: event.target.value })} autoComplete="family-name" />
          </label>
          <label>
            Email
            <input type="email" value={lead.email} onChange={(event) => setLead({ ...lead, email: event.target.value })} required autoComplete="email" />
          </label>
          <fieldset>
            <legend>Are you currently based in the United States?</legend>
            <label className="learn-inline">
              <input type="radio" name="us" checked={lead.usBased === 'yes'} onChange={() => setLead({ ...lead, usBased: 'yes' })} /> Yes
            </label>
            <label className="learn-inline">
              <input type="radio" name="us" checked={lead.usBased === 'no'} onChange={() => setLead({ ...lead, usBased: 'no' })} /> No
            </label>
          </fieldset>
          <label>
            Current situation
            <select value={lead.situation} onChange={(event) => setLead({ ...lead, situation: event.target.value })} required>
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
            <input type="checkbox" checked={lead.shareScore} onChange={(event) => setLead({ ...lead, shareScore: event.target.checked })} />
            Show my score on the public credential page
          </label>
          {error ? <p className="learn-feedback is-no" role="alert">{error}</p> : null}
          <div className="learn-pager">
            <button type="button" className="secondary-button on-light" onClick={() => setConfirming(false)} disabled={submitting}>
              Back to questions
            </button>
            <button type="submit" className="primary-button" disabled={!ready || submitting}>
              {submitting ? 'Submitting assessment…' : 'Submit assessment'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="learn-assessment">
      <header className="learn-assess-head">
        <p className="learn-kicker">Final assessment · about 20–25 minutes</p>
        <h1 tabIndex={-1} id="learn-question-heading">Question {index + 1} of {questions.length}</h1>
        <div className="learn-meter" aria-valuemin={0} aria-valuemax={questions.length || 1} aria-valuenow={index + 1} role="progressbar" aria-label="Assessment progress">
          <i style={{ width: `${questions.length ? ((index + 1) / questions.length) * 100 : 0}%` }} />
        </div>
      </header>
      <section className="learn-question">
        {question.stimulus ? <pre className="learn-response">{question.stimulus}</pre> : null}
        <h2>{question.prompt}</h2>
        {question.helper ? <p className="learn-hint">{question.helper}</p> : null}
        {question.type === 'written' ? (
          <textarea
            value={answers[question.id] ?? ''}
            placeholder={question.placeholder ?? 'Write a short justification'}
            rows={5}
            onChange={(event) => setAnswer(event.target.value)}
          />
        ) : (
          <div className="learn-option-list" role="radiogroup" aria-label={question.prompt}>
            {(question.options ?? []).map((option) => (
              <button
                key={option.id}
                type="button"
                className={`learn-option${answers[question.id] === option.id ? ' is-selected' : ''}`}
                aria-pressed={answers[question.id] === option.id}
                {...pressProps(() => setAnswer(option.id))}
              >
                <span>{option.id}</span>
                {option.label}
              </button>
            ))}
          </div>
        )}
      </section>
      <nav className="learn-pager">
        <button type="button" className="secondary-button on-light" disabled={index === 0} onClick={() => setIndex((value) => value - 1)}>
          Back
        </button>
        {index < questions.length - 1 ? (
          <button type="button" className="primary-button" onClick={() => setIndex((value) => value + 1)}>
            Next
          </button>
        ) : (
          <button type="button" className="primary-button" onClick={() => setConfirming(true)}>
            Review and submit
          </button>
        )}
      </nav>
      <p className="learn-hint">{answeredCount} answered · answers save automatically · score is hidden until you submit</p>
    </div>
  );
}
