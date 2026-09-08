'use client';

import { useState } from 'react';
import { pressProps } from '../../../lib/press';
import CompareCard from './CompareCard';

export type PracticeScenario = {
  id: string;
  lab: string;
  prompt: string;
  responseA?: string;
  responseB?: string;
  preferred?: string;
  rubric: string[];
  explanation?: string;
  example?: string;
  expectedConcepts?: string[];
};

export default function PracticeExercise({
  item,
  onAnswered,
}: {
  item: PracticeScenario;
  onAnswered: () => void;
}) {
  const why = item.explanation || item.example || '';

  if (item.responseA && item.responseB && (item.preferred === 'A' || item.preferred === 'B')) {
    return (
      <CompareCard
        prompt={item.prompt}
        a={item.responseA.replace(/\\n/g, '\n')}
        b={item.responseB.replace(/\\n/g, '\n')}
        correct={item.preferred}
        why={why}
        onPicked={onAnswered}
      />
    );
  }

  if (item.preferred === 'A' || item.preferred === 'B') {
    return (
      <CompareCard
        prompt={item.prompt}
        correct={item.preferred}
        why={why}
        onPicked={onAnswered}
      />
    );
  }

  if (item.preferred === 'flag') {
    return (
      <FlagCard prompt={item.prompt} why={why} onPicked={onAnswered} />
    );
  }

  if (item.example || item.expectedConcepts) {
    return (
      <JustificationCard
        prompt={item.prompt}
        example={item.example || why}
        expectedConcepts={item.expectedConcepts}
        onSubmit={onAnswered}
      />
    );
  }

  return null;
}

function FlagCard({
  prompt,
  why,
  onPicked,
}: {
  prompt: string;
  why: string;
  onPicked: () => void;
}) {
  const [picked, setPicked] = useState<'flag' | 'accept' | null>(null);
  const options = [
    { id: 'flag' as const, label: 'Flag for verification' },
    { id: 'accept' as const, label: 'Accept the claim as true' },
  ];
  return (
    <section className="learn-compare">
      <p className="learn-prompt-label">Claim</p>
      <blockquote className="learn-prompt">{prompt}</blockquote>
      <div className="learn-option-list" role="radiogroup" aria-label="How should you treat this claim?">
        {options.map((option) => {
          const selected = picked === option.id;
          const ok = option.id === 'flag';
          const show = Boolean(picked);
          return (
            <button
              key={option.id}
              type="button"
              className={`learn-option${selected && ok ? ' is-correct' : ''}${selected && !ok ? ' is-wrong' : ''}${show && ok ? ' is-answer' : ''}`}
              disabled={Boolean(picked)}
              {...pressProps(() => {
                if (picked) return;
                setPicked(option.id);
                onPicked();
              })}
            >
              <span>{option.id === 'flag' ? 'A' : 'B'}</span>
              {option.label}
            </button>
          );
        })}
      </div>
      {picked ? (
        <p className={`learn-feedback ${picked === 'flag' ? 'is-ok' : 'is-no'}`} role="status">
          {picked === 'flag' ? 'Correct. ' : 'Not quite. '}
          {why}
        </p>
      ) : (
        <p className="learn-hint">Choose how you would treat this claim.</p>
      )}
    </section>
  );
}

function JustificationCard({
  prompt,
  example,
  expectedConcepts,
  onSubmit,
}: {
  prompt: string;
  example: string;
  expectedConcepts?: string[];
  onSubmit: () => void;
}) {
  const [text, setText] = useState('');
  const [done, setDone] = useState(false);
  const ready = text.trim().length >= 24;

  return (
    <section className="learn-question">
      <p className="learn-prompt-label">Prompt</p>
      <blockquote className="learn-prompt">{prompt}</blockquote>
      <label>
        Your 2-sentence justification
        <textarea
          value={text}
          rows={5}
          placeholder="Write a short, specific justification"
          onChange={(event) => setText(event.target.value)}
          disabled={done}
        />
      </label>
      {done ? (
        <div className="learn-lab-complete">
          <p className="learn-feedback is-ok" role="status">
            Compare your reasoning with this example.
          </p>
          <p className="learn-note">{example}</p>
          {expectedConcepts?.length ? (
            <ul className="learn-checklist">
              {expectedConcepts.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : (
        <p className="learn-hint">Write a justification, then check it against the example.</p>
      )}
      {!done ? (
        <div className="learn-pager">
          <button
            type="button"
            className="primary-button"
            disabled={!ready}
            onClick={() => {
              setDone(true);
              onSubmit();
            }}
          >
            Check my justification
          </button>
        </div>
      ) : null}
    </section>
  );
}
