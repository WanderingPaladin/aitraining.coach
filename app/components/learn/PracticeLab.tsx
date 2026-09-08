'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import scenarios from '../../../lib/learn/data/practical-scenarios.json';
import { LEARN_PATH } from '../../../lib/learn/course';
import { courseBackAction, getNextLearningStep, labSlug } from '../../../lib/learn/sequence';
import { isLabComplete, markLabCompleteLocal } from '../../../lib/learn/storage';
import { trackEvent } from '../../../lib/tracking';
import { useLearnProgress } from '../../hooks/useLearnProgress';
import CourseNav from './CourseNav';
import LearnShell from './LearnShell';
import PracticeExercise, { type PracticeScenario } from './PracticeExercise';

export default function PracticeLab({ labId }: { labId: string }) {
  const items = useMemo(
    () => scenarios.scenarios.filter((item) => labSlug(item.lab) === labId),
    [labId],
  );
  const { state, updateAndPersist, ready } = useLearnProgress();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [answered, setAnswered] = useState<Record<string, boolean>>({});
  const complete = items[0] ? isLabComplete(state, labSlug(items[0].lab)) : false;
  const allAnswered = items.length > 0 && items.every((item) => answered[item.id]);

  useEffect(() => {
    if (items[0]) trackEvent({ eventType: 'practice_started', metadata: { lab: items[0].lab } });
  }, [items]);

  useEffect(() => {
    if (!complete) return;
    document.getElementById('learn-next-step')?.focus();
  }, [complete]);

  if (!items.length) {
    return (
      <LearnShell>
        <div className="journal-light">
          <div className="shell journal-main">
            <p className="learn-empty">That practice lab could not be found.</p>
            <p><a href={LEARN_PATH.course}>Back to course</a></p>
          </div>
        </div>
      </LearnShell>
    );
  }

  const labTitle = items[0].lab;
  const slug = labSlug(labTitle);
  const next = getNextLearningStep({ currentType: 'practice', currentId: slug, state });

  async function markComplete() {
    if (saving || complete || !allAnswered) return;
    setSaving(true);
    setError('');
    try {
      await updateAndPersist({ completedLabs: markLabCompleteLocal(state, slug) });
      trackEvent({ eventType: 'practice_completed', metadata: { lab: labTitle } });
    } catch {
      setError("We couldn't save your completion.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <LearnShell>
      <div className="journal-light">
        <div className="shell journal-main">
          <p className="learn-kicker">
            <a href={LEARN_PATH.course}>AI Training Foundations</a>
            {' / '}
            <a href={LEARN_PATH.practice}>Practice Labs</a>
            {' / '}
            {labTitle}
          </p>
          <h1>{labTitle}</h1>
          {items.map((item) => (
            <PracticeExercise
              key={item.id}
              item={item as PracticeScenario}
              onAnswered={() => setAnswered((current) => ({ ...current, [item.id]: true }))}
            />
          ))}
          {!complete && !allAnswered ? (
            <p className="learn-hint">Answer the exercise to mark this lab complete.</p>
          ) : null}
          {complete ? (
            <div className="learn-lab-complete" role="status">
              <p className="learn-feedback is-ok">
                <CheckCircle2 size={18} strokeWidth={2} aria-hidden="true" />
                Lab complete
              </p>
              <p>Nice work — this practice lab is complete. This does not change your assessment score.</p>
            </div>
          ) : error ? (
            <div className="learn-lab-complete" role="alert">
              <p className="learn-feedback is-no">{error}</p>
            </div>
          ) : null}
          <CourseNav
            back={courseBackAction()}
            primary={
              complete
                ? { href: next.href, label: next.label, id: 'learn-next-step' }
                : {
                    label: saving ? 'Saving…' : error ? 'Try again' : 'Mark lab complete',
                    onClick: () => void markComplete(),
                    disabled: saving || !ready || !allAnswered,
                  }
            }
          />
        </div>
      </div>
    </LearnShell>
  );
}
