'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiError } from '../../../lib/api';
import {
  saveAssessmentAnswers,
  startAssessment,
  submitAssessment,
  type PublicQuestion,
} from '../../../lib/learn/api';
import { LEARN_PATH } from '../../../lib/learn/course';
import { learnErrorMessage, learnErrorTitle } from '../../../lib/learn/errors';
import { readLearnState, writeLearnState } from '../../../lib/learn/storage';
import { trackEvent } from '../../../lib/tracking';
import AssessmentBottomNav from './AssessmentBottomNav';
import AssessmentErrorState from './AssessmentErrorState';
import AssessmentQuestionCard from './AssessmentQuestionCard';
import {
  AssessmentComplete,
  AssessmentIdentityForm,
  AssessmentRetakeGate,
  AssessmentReview,
  type AssessmentLead,
} from './AssessmentReview';
import AssessmentShell from './AssessmentShell';
import AssessmentSidebar, { QuestionNavigator } from './AssessmentSidebar';
import AssessmentSkeleton from './AssessmentSkeleton';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';
type Screen = 'questions' | 'review' | 'identity' | 'complete';

export default function AssessmentClient() {
  const router = useRouter();
  const [questions, setQuestions] = useState<PublicQuestion[]>([]);
  const [attemptId, setAttemptId] = useState('');
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [errorTitle, setErrorTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [awaitingRetake, setAwaitingRetake] = useState(false);
  const [screen, setScreen] = useState<Screen>('questions');
  const [submitting, setSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [navigating, setNavigating] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [resultHref, setResultHref] = useState('');
  const submitLock = useRef(false);
  const answersRef = useRef<Record<string, string>>({});
  const flaggedRef = useRef<string[]>([]);
  const indexRef = useRef(0);
  const attemptRef = useRef('');
  const debounceRef = useRef<number | null>(null);
  const saveChain = useRef(Promise.resolve());
  const retakeConfirmed = useRef(false);
  const [lead, setLead] = useState<AssessmentLead>({
    firstName: '',
    lastName: '',
    email: '',
    usBased: '',
    situation: '',
    state: '',
    shareScore: true,
  });
  const startGen = useRef(0);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);
  useEffect(() => {
    flaggedRef.current = flagged;
  }, [flagged]);
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
    if (retake && !retakeConfirmed.current) {
      setAwaitingRetake(true);
      setLoading(false);
      setError('');
      setErrorTitle('');
      return;
    }
    if (local.completedModules.length < 8 && !local.attemptId && !retake) {
      setErrorTitle("We couldn't load your assessment.");
      setError('Complete all eight modules before starting the final assessment.');
      setLoading(false);
      return;
    }
    setError('');
    setErrorTitle('');
    setAwaitingRetake(false);
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
        const restored = {
          ...(!retake && local.attemptId === result.attempt.id ? local.answers : {}),
          ...(result.attempt.answers ?? {}),
        };
        const restoredFlags =
          !retake && local.attemptId === result.attempt.id ? local.flaggedQuestionIds : [];
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
        setFlagged(restoredFlags);
        flaggedRef.current = restoredFlags;
        setIndex(nextIndex);
        indexRef.current = nextIndex;
        setScreen('questions');
        writeLearnState({
          attemptId: result.attempt.id,
          answers: restored,
          questionIds: result.questions.map((item) => item.id),
          flaggedQuestionIds: restoredFlags,
          ...(retake ? { resultId: null, passed: false } : {}),
        });
        if (local.attemptId !== result.attempt.id) {
          trackEvent({ eventType: 'assessment_started', metadata: { attemptId: result.attempt.id } });
        }
        setSaveStatus(Object.keys(restored).length ? 'saved' : 'idle');
        if (retake) router.replace(LEARN_PATH.assessment);
      })
      .catch((err) => {
        if (gen !== startGen.current) return;
        setErrorTitle(learnErrorTitle(err));
        setError(learnErrorMessage(err));
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
    if (loading || screen !== 'questions') return;
    document.getElementById('learn-question-heading')?.focus();
  }, [index, loading, screen]);

  useEffect(() => {
    if (!navOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setNavOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navOpen]);

  const question = questions[index];
  const answeredCount = useMemo(
    () => questions.filter((item) => Boolean(answers[item.id]?.trim())).length,
    [answers, questions],
  );
  const percent = questions.length ? Math.round((answeredCount / questions.length) * 100) : 0;
  const navLocked = navigating || submitting || saveStatus === 'error';

  function persist(nextIndex = indexRef.current) {
    const id = attemptRef.current;
    if (!id) return Promise.resolve();
    writeLearnState({
      attemptId: id,
      answers: { ...answersRef.current },
      questionIds: questions.map((item) => item.id),
      flaggedQuestionIds: [...flaggedRef.current],
    });
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

  function toggleFlag() {
    if (!question) return;
    const next = flaggedRef.current.includes(question.id)
      ? flaggedRef.current.filter((id) => id !== question.id)
      : [...flaggedRef.current, question.id];
    flaggedRef.current = next;
    setFlagged(next);
    writeLearnState({ flaggedQuestionIds: next });
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
      setScreen('questions');
      setNavOpen(false);
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
      setScreen('review');
      setNavOpen(false);
    } catch {
      setError('Not saved — Retry');
    } finally {
      setNavigating(false);
    }
  }

  async function saveAndExit() {
    try {
      await persist(indexRef.current);
    } catch {
      // keep local answers even if the network save failed
    }
    router.push(LEARN_PATH.course);
  }

  function startRetake() {
    retakeConfirmed.current = true;
    setAwaitingRetake(false);
    beginAttempt();
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
      writeLearnState({
        attemptId,
        answers: { ...answersRef.current },
        questionIds: questions.map((item) => item.id),
        flaggedQuestionIds: [...flaggedRef.current],
      });
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
      setResultHref(`/learn/ai-training-foundations/results/${result.attemptId}`);
      setScreen('complete');
      setSubmitting(false);
    } catch (err) {
      if (err instanceof ApiError && (err.code === 'ALREADY_SUBMITTED' || err.status === 409)) {
        writeLearnState({ resultId: attemptId, attemptId });
        router.replace(`/learn/ai-training-foundations/results/${attemptId}`);
        return;
      }
      setErrorTitle('');
      setError(learnErrorMessage(err));
      submitLock.current = false;
      setSubmitting(false);
    }
  }

  const retrySave = () => void persist(index).catch(() => {});

  if (loading) {
    return (
      <AssessmentShell saveStatus="idle" onSaveExit={() => router.push(LEARN_PATH.course)}>
        <AssessmentSkeleton />
      </AssessmentShell>
    );
  }

  if (awaitingRetake) {
    return (
      <AssessmentShell>
        <AssessmentRetakeGate onStart={startRetake} />
      </AssessmentShell>
    );
  }

  if (error && !question) {
    return (
      <AssessmentShell>
        <AssessmentErrorState title={errorTitle || undefined} body={error} onRetry={() => beginAttempt()} />
      </AssessmentShell>
    );
  }

  if (screen === 'complete' && resultHref) {
    return (
      <AssessmentShell>
        <AssessmentComplete href={resultHref} />
      </AssessmentShell>
    );
  }

  if (!question) {
    return (
      <AssessmentShell>
        <AssessmentErrorState
          title="We couldn't load your assessment."
          body="No questions are available right now."
          onRetry={() => beginAttempt()}
        />
      </AssessmentShell>
    );
  }

  if (screen === 'identity') {
    return (
      <AssessmentShell saveStatus={saveStatus} onSaveExit={() => void saveAndExit()} onRetrySave={retrySave}>
        <AssessmentIdentityForm
          lead={lead}
          setLead={setLead}
          questions={questions}
          answers={answers}
          flagged={flagged}
          error={error}
          submitting={submitting}
          onBack={() => {
            setError('');
            setScreen('review');
          }}
          onSubmit={() => void submit()}
        />
      </AssessmentShell>
    );
  }

  if (screen === 'review') {
    return (
      <AssessmentShell saveStatus={saveStatus} onSaveExit={() => void saveAndExit()} onRetrySave={retrySave}>
        <AssessmentReview
          questions={questions}
          answers={answers}
          flagged={flagged}
          onJump={(next) => void goTo(next)}
          onContinue={() => setScreen('questions')}
          onSubmit={() => setScreen('identity')}
        />
      </AssessmentShell>
    );
  }

  return (
    <AssessmentShell
      saveStatus={saveStatus}
      onSaveExit={() => void saveAndExit()}
      onRetrySave={retrySave}
      saveDisabled={navigating || submitting}
      footer={
        <AssessmentBottomNav
          index={index}
          total={questions.length}
          flagged={flagged.includes(question.id)}
          locked={navLocked}
          onPrev={() => void goTo(index - 1)}
          onNext={() => void goTo(index + 1)}
          onFlag={toggleFlag}
          onReview={() => void openReview()}
          onOpenNavigator={() => setNavOpen(true)}
        />
      }
    >
      <header className="learn-assess-head">
        <div>
          <h1>Final Assessment</h1>
          <p className="learn-lead">Apply what you've learned across AI Training Foundations.</p>
        </div>
        <div className="learn-assess-head-progress">
          <p>
            Question {index + 1} of {questions.length}
          </p>
          <b>{percent}% complete</b>
          <span
            className="learn-meter"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            role="progressbar"
            aria-label={`${percent}% complete`}
          >
            <i style={{ width: `${percent}%` }} />
          </span>
        </div>
      </header>
      <div className="learn-assess-layout">
        <div className="learn-assess-main">
          <AssessmentQuestionCard
            question={question}
            number={index + 1}
            total={questions.length}
            value={answers[question.id] ?? ''}
            disabled={navigating || submitting}
            onAnswer={setAnswer}
          />
          {error && saveStatus === 'error' ? (
            <p className="learn-feedback is-no" role="alert">
              {error}
            </p>
          ) : null}
        </div>
        <AssessmentSidebar
          questions={questions}
          current={index}
          answers={answers}
          flagged={flagged}
          onJump={(next) => void goTo(next)}
        />
      </div>
      {navOpen ? (
        <div
          className="learn-assess-sheet"
          role="dialog"
          aria-modal="true"
          aria-label="Question navigator"
          onClick={() => setNavOpen(false)}
        >
          <div className="learn-assess-sheet-card" onClick={(event) => event.stopPropagation()}>
            <div className="learn-assess-sheet-head">
              <p className="learn-kicker">Question Navigator</p>
              <button type="button" className="learn-assess-link" onClick={() => setNavOpen(false)}>
                Close
              </button>
            </div>
            <QuestionNavigator
              questions={questions}
              current={index}
              answers={answers}
              flagged={flagged}
              onJump={(next) => void goTo(next)}
            />
          </div>
        </div>
      ) : null}
    </AssessmentShell>
  );
}
