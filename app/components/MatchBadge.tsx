'use client';

import type { OpportunityMatch } from '../../lib/api';
import { useAuth } from './AuthProvider';

export default function MatchBadge({ match }: { match: OpportunityMatch | null }) {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return (
      <a className="match-badge is-prompt" href="/login?next=/opportunities">
        See your match
      </a>
    );
  }

  if (!match) {
    return (
      <a className="match-badge is-prompt" href="/profile/edit">
        Complete profile to see match
      </a>
    );
  }

  return (
    <details className="match-badge">
      <summary>
        <strong>{match.score}% Profile Match</strong>
        <span>{match.label}</span>
      </summary>
      <div className="match-explain">
        <p>Why this matches you</p>
        <p className="match-disclaimer">This is a profile-to-listing fit score, not a chance of being hired.</p>
        <ul>
          {match.reasons.map((reason) => (
            <li key={reason.text} data-kind={reason.kind}>
              {reason.kind === 'match' ? '✓' : reason.kind === 'hard' ? '!' : '△'} {reason.text}
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}
