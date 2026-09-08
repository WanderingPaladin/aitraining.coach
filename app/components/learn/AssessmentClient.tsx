'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RotateCcw } from 'lucide-react';
import { usStates } from '../../../lib/apply-fields';
import { ApiError } from '../../../lib/api';
import {
  saveAssessmentAnswers,
  startAssessment,
  submitAssessment,
  type PublicQuestion,
} from '../../../lib/learn/api';
import { LEARN_PATH } from '../../../lib/learn/course';
import { learnErrorMessage } from '../../../lib/learn/errors';
import { courseBackAction } from '../../../lib/learn/sequence';
import { readLearnState, writeLearnState } from '../../../lib/learn/storage';
import { trackEvent } from '../../../lib/tracking';
import { pressProps } from '../../../lib/press';
import CourseNav from './CourseNav';

const SITUATIONS = [
  { id: 'completely_new', label: 'I’m completely new' },
  { id: 'accounts_no_work', label: 'I created accounts but haven’t gotten work' },
  { id: 'assessments_little_work', label: 'I passed assessments but have little/no work' },
  { id: 'already_working', label: 'I’m already completing AI-training work' },
  { id: 'researching', label: 'I’m just researching' },
];

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

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
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [navigating, setNavigating] = useState(false);
  const submitLock = useRef(false);
  const answersRef = useRef<Record<string, string>>({});
  const indexRef = useRef(0);
  const attemptRef = useRef('');
  const debounceRef = useRef<number | null>(null);
  const saveChain = useRef(Promise.resolve());
  const [lead, setLead] = useState({
    firstName: '',
    lastName: '',
    email: '',
    usBased: '' as '' | 'yes' | 'no',
    situation: '',
    state: '',
    shareScore: true,
  });
  const startGen = useRef(0);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);
  useEffect(() => {
    indexRef.current = index;
  }, [index]);
  useEffect(() => {
    attemptRef.current = attemptId;
  }, [attemptId]);

  const beginAttempt = useCallback(() => {
    const gen = ++startGen.current;
    const local = readLearnState();
    const retake = new URLSearchParams(window.location.search).get('retake') === '1';
    if (local.resultId && !retake) {
      router.replace(`/learn/ai-training-foundations/results/${local.resultId}`);
      return;
    }
    if (local.completedModules.length < 8 && !local.attemptId && !retake) {
      setError('Complete all eight modules before starting the final assessment.');
      setLoading(false);
      return;
    }
    setError('');
    setLoading(true);
    const existing = retake ? undefined : local.attemptId || undefined;
    startAssessment(existing, retake)
      .then((result) => {
        if (gen !== startGen.current) return;
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
        const restoredIndex = result.attempt.currentIndex;
        const firstOpen = result.questions.findIndex((item) => !String(restored[item.id] ?? '').trim());
        const nextIndex =
          typeof restoredIndex === 'number' && Number.isFinite(restoredIndex)
            ? Math.min(Math.max(0, restoredIndex), Math.max(0, result.questions.length - 1))
            : firstOpen >= 0
              ? firstOpen
              : 0;
        setQuestions(result.questions);
        setAttemptId(result.attempt.id);
        setAnswers(restored);
        answersRef.current = restored;
        setIndex(nextIndex);
        indexRef.current = nextIndex;
        writeLearnState(
          retake
            ? { attemptId: result.attempt.id, resultId: null, passed: false }
            : { attemptId: result.attempt.id },
        );
        if (local.attemptId !== result.attempt.id) {
          trackEvent({ eventType: 'assessment_started', metadata: { attemptId: result.attempt.id } });
        }
        setSaveStatus(Object.keys(restored).length ? 'saved' : 'idle');
      })
      .catch((err) => {
        if (gen === startGen.current) setError(learnErrorMessage(err));
      })
      .finally(() => {
        if (gen === startGen.current) setLoading(false);
      });
  }, [router]);

  useEffect(() => {
    beginAttempt();
    return () => {
      startGen.current += 1;
    };
  }, [beginAttempt]);

  useEffect(() => {
    if (loading || confirming) return;
    document.getElementById('learn-question-heading')?.focus();
  }, [index, loading, confirming]);

  const question = questions[index];
  const answeredCount = useMemo(
    () => questions.filter((item) => Boolean(answers[item.id]?.trim())).length,
    [answers, questions],
  );

  function persist(nextIndex = indexRef.current) {
    const id = attemptRef.current;
    if (!id) return Promise.resolve();
    setSaveStatus('saving');
    const job = saveChain.current.then(
      () => saveAssessmentAnswers(attemptRef.current || id, { ...answersRef.current }, nextIndex),
      () => saveAssessmentAnswers(attemptRef.current || id, { ...answersRef.current }, nextIndex),
    );
    saveChain.current = job.then(
      () => undefined,
      () => undefined,
    );
    return job
      .then(() => {
        setSaveStatus('saved');
      })
      .catch((err) => {
        if (err instanceof ApiError && (err.code === 'ALREADY_SUBMITTED' || err.status === 409)) {
          writeLearnState({ resultId: id, attemptId: id });
          router.replace(`/learn/ai-training-foundations/results/${id}`);
          return;
        }
        setSaveStatus('error');
        throw err;
      });
  }

  function setAnswer(value: string) {
    if (!question || submitting || navigating) return;
    const next = { ...answersRef.current, [question.id]: value };
    answersRef.current = next;
    setAnswers(next);
    if (!attemptId) return;
    if (question.type === 'written') {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      debounceRef.current = window.setTimeout(() => {
        void persist(indexRef.current).catch(() => {});
      }, 500);
      return;
    }
    void persist(indexRef.current).catch(() => {});
  }

  async function goTo(nextIndex: number) {
    if (navigating || submitting) return;
    if (nextIndex < 0 || nextIndex >= questions.length) return;
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    setNavigating(true);
    setError('');
    try {
      await persist(nextIndex);
      setIndex(nextIndex);
    } catch {
      setError('Not saved — Retry');
    } finally {
      setNavigating(false);
    }
  }

  async function openReview() {
    if (navigating || submitting) return;
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    setNavigating(true);
    try {
      await persist(indexRef.current);
      setConfirming(true);
    } catch {
      setError('Not saved — Retry');
    } finally {
      setNavigating(false);
    }
  }

  async function submit() {
    if (!attemptId || submitLock.current) return;
    submitLock.current = true;
    setSubmitting(true);
    setError('');
    try {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      await persist(indexRef.current);
      const honeypot = (document.querySelector('input[name="companyWebsite"]') as HTMLInputElement | null)?.value;
      const result = await submitAssessment(attemptId, {
        answers: answersRef.current,
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
      <div className="learn-empty-state" role="alert">
        <p className="learn-empty">{error}</p>
        <div className="learn-pager">
          <button type="button" className="primary-button" onClick={() => beginAttempt()}>
            Try again
          </button>
          <a className="secondary-button on-light" href={LEARN_PATH.course}>
            Back to course
          </a>
        </div>
      </div>
    );
  }
  if (!question) return <p className="learn-empty">No questions available.</p>;

  const navLocked = navigating || submitting || saveStatus === 'error';

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
        <CourseNav back={courseBackAction()} />
      </div>
    );
  }

  return (
    <div className="learn-assessment">
      <header className="learn-assess-head">
        <p className="learn-kicker">
          <a href={LEARN_PATH.course}>AI Training Foundations</a>
          {' / '}
          Final assessment · about 20–25 minutes
        </p>
        <div className="learn-assess-title-row">
          <h1 tabIndex={-1} id="learn-question-heading">Question {index + 1} of {questions.length}</h1>
          <p className="learn-save-status" aria-live="polite">
            {saveStatus === 'saving' || navigating ? 'Saving…' : null}
            {saveStatus === 'saved' ? 'Saved ✓' : null}
            {saveStatus === 'error' ? (
              <button type="button" className="learn-text-retry" onClick={() => void persist(index).catch(() => {})}>
                <RotateCcw size={14} strokeWidth={2} aria-hidden="true" />
                Not saved — Retry
              </button>
            ) : null}
          </p>
        </div>
        <div
          className="learn-meter"
          aria-valuemin={1}
          aria-valuemax={questions.length || 1}
          aria-valuenow={index + 1}
          role="progressbar"
          aria-label={`Question ${index + 1} of ${questions.length}`}
        >
          <i style={{ width: `${questions.length ? ((index + 1) / questions.length) * 100 : 0}%` }} />
        </div>
        <p className="learn-hint">{answeredCount} of {questions.length} answered</p>
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
                disabled={navigating || submitting}
                {...pressProps(() => setAnswer(option.id))}
              >
                <span>{option.id}</span>
                {option.label}
              </button>
            ))}
          </div>
        )}
      </section>
      {error && saveStatus === 'error' ? <p className="learn-feedback is-no" role="alert">{error}</p> : null}
      <nav className="learn-pager learn-course-nav" aria-label="Assessment questions">
        <button type="button" className="secondary-button on-light" disabled={index === 0 || navLocked} onClick={() => void goTo(index - 1)}>
          Back
        </button>
        {index < questions.length - 1 ? (
          <button type="button" className="primary-button" disabled={navLocked} onClick={() => void goTo(index + 1)}>
            {navigating ? 'Saving…' : 'Next'}
          </button>
        ) : (
          <button type="button" className="primary-button" disabled={navLocked} onClick={() => void openReview()}>
            {navigating ? 'Saving…' : 'Review and submit'}
          </button>
        )}
      </nav>
      <CourseNav back={courseBackAction()} />
    </div>
  );
}
