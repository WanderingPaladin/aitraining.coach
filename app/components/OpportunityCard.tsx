'use client';

import { Bookmark, BookmarkCheck, BriefcaseBusiness, ExternalLink, GraduationCap, Laptop, MapPin } from 'lucide-react';
import { useState } from 'react';
import type { Opportunity } from '../../lib/api';
import { saveOpportunity, unsaveOpportunity } from '../../lib/api';
import { platformLogoSrc } from '../../lib/platforms';
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
  const returnTo = `/opportunities`;

  async function toggleSave() {
    if (!user) {
      window.location.href = `/login?returnTo=${encodeURIComponent(returnTo)}`;
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

  const chips: Array<{ icon: typeof BriefcaseBusiness; text: string }> = [
    { icon: BriefcaseBusiness, text: opportunity.category },
  ];
  if (opportunity.location || opportunity.remoteStatus) {
    chips.push({
      icon: opportunity.remoteStatus === 'remote' ? Laptop : MapPin,
      text: opportunity.location || 'Remote',
    });
  }
  if (opportunity.employmentType) {
    chips.push({
      icon: BriefcaseBusiness,
      text: opportunity.employmentType.replace(/-/g, ' '),
    });
  }
  if (!opportunity.beginnerFriendly && opportunity.experienceRequirement) {
    chips.push({
      icon: GraduationCap,
      text: opportunity.experienceRequirement.length <= 32 ? opportunity.experienceRequirement : 'Experienced',
    });
  }

  const isJob = opportunity.listingKind === 'job';
  const viewHref = isJob && opportunity.slug ? `/opportunities/${opportunity.slug}` : opportunity.sourceUrl;
  const viewExternal = !isJob;

  return (
    <article className={`opportunity-card${compact ? ' is-compact' : ''}`}>
      {isJob ? null : (
        <button
          type="button"
          className={`save-button${saved ? ' is-saved' : ''}`}
          onClick={() => void toggleSave()}
          disabled={busy}
          aria-label={saved ? 'Remove saved opportunity' : 'Save opportunity'}
        >
          {saved ? <BookmarkCheck size={16} strokeWidth={2} /> : <Bookmark size={16} strokeWidth={2} />}
        </button>
      )}
      {opportunity.companyLogoUrl ? (
        <img className="opportunity-logo" src={opportunity.companyLogoUrl} alt="" width={48} height={48} />
      ) : isJob ? (
        <span className="opportunity-letter-logo" aria-hidden="true">
          {opportunity.sourcePlatform.slice(0, 1).toUpperCase()}
        </span>
      ) : (
        <img
          className="opportunity-logo"
          src={platformLogoSrc(opportunity.sourcePlatform)}
          alt=""
          width={48}
          height={48}
        />
      )}
      <div className="opportunity-body">
        <div className="opportunity-title-row">
          <h3>{isJob && opportunity.slug ? <a href={`/opportunities/${opportunity.slug}`}>{opportunity.title}</a> : opportunity.title}</h3>
          {opportunity.beginnerFriendly ? <span className="beginner-label">Beginner Friendly</span> : null}
        </div>
        <p className="opportunity-platform">
          {opportunity.sourcePlatform}
          {viewExternal ? <ExternalLink size={13} strokeWidth={2} aria-hidden="true" /> : null}
        </p>
        <ul className="opportunity-meta">
          {chips.slice(0, 4).map((chip) => {
            const Icon = chip.icon;
            return (
              <li key={`${chip.text}-${chip.icon.displayName ?? chip.text}`}>
                <Icon size={14} strokeWidth={2} aria-hidden="true" />
                {chip.text}
              </li>
            );
          })}
        </ul>
        <p className="opportunity-summary">{opportunity.summary}</p>
      </div>
      <div className="opportunity-card-actions">
        {opportunity.compensationText ? (
          <p className="opportunity-pay">{opportunity.compensationText}</p>
        ) : null}
        {isJob ? (
          <p className="match-badge is-prompt">Employer listing</p>
        ) : (
          <MatchBadge match={opportunity.match} returnTo={returnTo} />
        )}
        <a
          className="primary-button opportunity-view"
          href={viewHref}
          {...(viewExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          View Opportunity
          {viewExternal ? <ExternalLink className="btn-icon" size={16} strokeWidth={2} /> : null}
        </a>
      </div>
    </article>
  );
}
