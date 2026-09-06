'use client';

import { CheckCircle2, ChevronDown, Circle, CircleHelp, Info, Sparkles, UserRound } from 'lucide-react';
import { useState } from 'react';
import type { MatchFactor, OpportunityMatch } from '../../lib/api';
import { useAuth } from './AuthProvider';

function band(score: number): string {
  if (score >= 90) return 'excellent';
  if (score >= 80) return 'strong';
  if (score >= 70) return 'good';
  if (score >= 60) return 'possible';
  return 'limited';
}

function FactorIcon({ status }: { status: MatchFactor['status'] }) {
  if (status === 'matched') return <CheckCircle2 size={14} strokeWidth={2} aria-hidden="true" />;
  return <Circle size={14} strokeWidth={2} aria-hidden="true" />;
}

function FactorList({ title, items }: { title: string; items: MatchFactor[] }) {
  if (!items.length) return null;
  return (
    <div className="match-factor-group">
      <p>{title}</p>
      <ul>
        {items.map((item) => (
          <li key={item.key} data-status={item.status}>
            <FactorIcon status={item.status} />
            <span>
              <strong>{item.label}</strong>
              {item.description}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function MatchBadge({
  match,
  returnTo = '/opportunities',
  compact = false,
}: {
  match: OpportunityMatch | null;
  returnTo?: string;
  compact?: boolean;
}) {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);

  if (loading) {
    return <span className="match-badge is-skeleton" aria-hidden="true" />;
  }

  if (!user) {
    return (
      <a className="match-badge is-prompt" href={`/login?returnTo=${encodeURIComponent(returnTo)}`}>
        <Sparkles size={16} strokeWidth={2} aria-hidden="true" />
        See your match
      </a>
    );
  }

  if (!match) {
    return (
      <a className="match-badge is-prompt" href="/profile/edit">
        <UserRound size={16} strokeWidth={2} aria-hidden="true" />
        Complete profile to see match
      </a>
    );
  }

  const matched = match.matchedFactors ?? [];
  const partial = match.partialFactors ?? [];
  const missing = match.missingFactors ?? [];
  const fallbackReasons = !matched.length && !partial.length && !missing.length;

  return (
    <details
      className={`match-badge${compact ? ' is-compact' : ''}`}
      data-band={band(match.score)}
      open={open}
      onToggle={(event) => setOpen((event.currentTarget as HTMLDetailsElement).open)}
    >
      <summary aria-expanded={open}>
        <span className="match-badge-kicker">Profile Match</span>
        <strong>
          {match.score}% · {match.label}
        </strong>
        <span className="match-badge-hint">Based on your profile and this opportunity</span>
        <em>
          <CircleHelp size={14} strokeWidth={2} aria-hidden="true" />
          Why this match?
          <ChevronDown size={14} strokeWidth={2} aria-hidden="true" />
        </em>
      </summary>
      <div className="match-explain">
        <p>Why your match is {match.score}%</p>
        <FactorList title="Strong signals" items={matched} />
        <FactorList title="Partial signals" items={partial} />
        <FactorList title="Areas that may improve your match" items={missing} />
        {fallbackReasons ? (
          <ul>
            {match.reasons.map((reason) => (
              <li key={reason.text} data-kind={reason.kind}>
                <Info size={14} strokeWidth={2} aria-hidden="true" />
                {reason.text}
              </li>
            ))}
          </ul>
        ) : null}
        <p className="match-calc-title">How is this calculated?</p>
        <p className="match-disclaimer">
          Profile Match compares information in your AI Trainers profile with the requirements and characteristics
          available for this opportunity. It is a guidance tool, not a prediction of hiring or platform acceptance.
        </p>
      </div>
    </details>
  );
}
