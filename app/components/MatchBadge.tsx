'use client';

import {
  AlertTriangle,
  Check,
  CircleAlert,
  CircleHelp,
  Sparkles,
  UserRound,
} from 'lucide-react';
import type { OpportunityMatch } from '../../lib/api';
import { useAuth } from './AuthProvider';

function band(score: number): string {
  if (score >= 90) return 'excellent';
  if (score >= 80) return 'strong';
  if (score >= 70) return 'good';
  if (score >= 60) return 'possible';
  return 'limited';
}

function ReasonIcon({ kind }: { kind: OpportunityMatch['reasons'][number]['kind'] }) {
  if (kind === 'match') return <Check size={14} strokeWidth={2} aria-hidden="true" />;
  if (kind === 'hard') return <CircleAlert size={14} strokeWidth={2} aria-hidden="true" />;
  return <AlertTriangle size={14} strokeWidth={2} aria-hidden="true" />;
}

export default function MatchBadge({
  match,
  returnTo = '/opportunities',
}: {
  match: OpportunityMatch | null;
  returnTo?: string;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return (
      <a
        className="match-badge is-prompt"
        href={`/login?returnTo=${encodeURIComponent(returnTo)}`}
      >
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

  return (
    <details className="match-badge" data-band={band(match.score)}>
      <summary>
        <strong>
          {match.score}% match
        </strong>
        <span>{match.label}</span>
        <em>
          <CircleHelp size={14} strokeWidth={2} aria-hidden="true" />
          Why this matches
        </em>
      </summary>
      <div className="match-explain">
        <p>Why this matches</p>
        <p className="match-disclaimer">Profile Match is a fit score from your profile and this listing. It is not a chance of being hired.</p>
        <ul>
          {match.reasons.map((reason) => (
            <li key={reason.text} data-kind={reason.kind}>
              <ReasonIcon kind={reason.kind} />
              {reason.text}
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}
