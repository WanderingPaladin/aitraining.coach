'use client';

import { Flag } from 'lucide-react';
import type { PublicQuestion } from '../../../lib/learn/api';

export default function AssessmentSidebar({
  questions,
  current,
  answers,
  flagged,
  onJump,
}: {
  questions: PublicQuestion[];
  current: number;
  answers: Record<string, string>;
  flagged: string[];
  onJump: (index: number) => void;
}) {
  const answered = questions.filter((item) => Boolean(answers[item.id]?.trim())).length;
  const flaggedCount = questions.filter((item) => flagged.includes(item.id)).length;
  const remaining = Math.max(0, questions.length - answered);
  const percent = questions.length ? Math.round((answered / questions.length) * 100) : 0;

  return (
    <aside className="learn-assess-sidebar">
      <div className="learn-assess-side-card">
        <p className="learn-kicker">Assessment Progress</p>
        <p className="learn-assess-side-count">
          {answered} / {questions.length}
        </p>
        <p className="learn-hint">{percent}% complete</p>
        <span className="learn-meter" aria-hidden="true">
          <i style={{ width: `${percent}%` }} />
        </span>
        <ul className="learn-assess-side-stats">
          <li>{answered} answered</li>
          <li>{flaggedCount} flagged</li>
          <li>{remaining} remaining</li>
        </ul>
      </div>
      <div className="learn-assess-side-card">
        <p className="learn-kicker">Question Navigator</p>
        <QuestionNavigator
          questions={questions}
          current={current}
          answers={answers}
          flagged={flagged}
          onJump={onJump}
        />
      </div>
    </aside>
  );
}

export function QuestionNavigator({
  questions,
  current,
  answers,
  flagged,
  onJump,
}: {
  questions: PublicQuestion[];
  current: number;
  answers: Record<string, string>;
  flagged: string[];
  onJump: (index: number) => void;
}) {
  return (
    <ol className="learn-assess-navgrid">
      {questions.map((item, index) => {
        const done = Boolean(answers[item.id]?.trim());
        const isFlagged = flagged.includes(item.id);
        const className = [
          'learn-assess-navq',
          index === current ? 'is-current' : '',
          done ? 'is-answered' : '',
          isFlagged ? 'is-flagged' : '',
        ]
          .filter(Boolean)
          .join(' ');
        return (
          <li key={item.id}>
            <button
              type="button"
              className={className}
              aria-current={index === current ? 'step' : undefined}
              aria-label={`Question ${index + 1}${done ? ', answered' : ', unanswered'}${isFlagged ? ', flagged' : ''}`}
              onClick={() => onJump(index)}
            >
              {index + 1}
              {isFlagged ? <Flag size={10} strokeWidth={2.4} aria-hidden="true" /> : null}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
