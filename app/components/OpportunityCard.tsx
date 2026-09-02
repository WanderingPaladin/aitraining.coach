'use client';

import { Bookmark, BookmarkCheck, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import type { Opportunity } from '../../lib/api';
import { saveOpportunity, unsaveOpportunity } from '../../lib/api';
import { useAuth } from './AuthProvider';
import MatchBadge from './MatchBadge';

export default function OpportunityCard({
  opportunity,
  compact = false,
  onSavedChange,
}: {
  opportunity: Opportunity;
  compact?: boolean;
  onSavedChange?: (id: string, saved: boolean) => void;
}) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(opportunity.saved);
  const [busy, setBusy] = useState(false);

  async function toggleSave() {
    if (!user) {
      window.location.href = `/login?next=${encodeURIComponent('/opportunities')}`;
      return;
    }
    setBusy(true);
    try {
      if (saved) {
        await unsaveOpportunity(opportunity.id);
        setSaved(false);
        onSavedChange?.(opportunity.id, false);
      } else {
        await saveOpportunity(opportunity.id);
        setSaved(true);
        onSavedChange?.(opportunity.id, true);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className={`opportunity-card${compact ? ' is-compact' : ''}`}>
      <div className="opportunity-card-top">
        <div>
          <p className="opportunity-platform">{opportunity.sourcePlatform}</p>
          <h3>{opportunity.title}</h3>
        </div>
        <MatchBadge match={opportunity.match} />
      </div>
      <p className="opportunity-summary">{opportunity.summary}</p>
      <ul className="opportunity-meta">
        <li>{opportunity.category}</li>
        {opportunity.experienceRequirement ? <li>{opportunity.experienceRequirement}</li> : null}
        {opportunity.location ? <li>{opportunity.location}</li> : null}
        {opportunity.beginnerFriendly ? <li>Beginner-friendly</li> : null}
        {opportunity.compensationText ? <li>{opportunity.compensationText}</li> : null}
      </ul>
      <div className="opportunity-card-actions">
        <a
          className="primary-button"
          href={opportunity.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          View Opportunity
          <ExternalLink className="btn-icon" size={16} strokeWidth={2} />
        </a>
        <button
          type="button"
          className={`save-button${saved ? ' is-saved' : ''}`}
          onClick={() => void toggleSave()}
          disabled={busy}
          aria-label={saved ? 'Remove saved opportunity' : 'Save opportunity'}
        >
          {saved ? <BookmarkCheck size={18} strokeWidth={2} /> : <Bookmark size={18} strokeWidth={2} />}
          {saved ? 'Saved' : 'Save'}
        </button>
      </div>
    </article>
  );
}
