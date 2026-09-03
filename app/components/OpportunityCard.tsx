'use client';

import { BriefcaseBusiness, DollarSign, ExternalLink, GraduationCap, Laptop, MapPin } from 'lucide-react';
import type { Opportunity } from '../../lib/api';
import { platformLogoSrc } from '../../lib/platforms';
import MatchBadge from './MatchBadge';

export default function OpportunityCard({
  opportunity,
  compact = false,
}: {
  opportunity: Opportunity;
  compact?: boolean;
}) {
  const returnTo = `/opportunities`;

  const chips: Array<{ icon: typeof BriefcaseBusiness; text: string }> = [];
  if (opportunity.remoteStatus === 'remote' || /remote/i.test(opportunity.location ?? '')) {
    chips.push({ icon: Laptop, text: 'Remote' });
  } else if (opportunity.location) {
    chips.push({ icon: MapPin, text: opportunity.location });
  }
  if (opportunity.category) {
    chips.push({ icon: BriefcaseBusiness, text: opportunity.category });
  }
  if (opportunity.beginnerFriendly) {
    chips.push({ icon: GraduationCap, text: 'Beginner Friendly' });
  } else if (opportunity.experienceRequirement) {
    chips.push({
      icon: GraduationCap,
      text: opportunity.experienceRequirement.length <= 32 ? opportunity.experienceRequirement : 'Experienced',
    });
  }
  if (opportunity.employmentType && chips.length < 4) {
    chips.push({
      icon: BriefcaseBusiness,
      text: opportunity.employmentType.replace(/[-_]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()),
    });
  }

  const isJob = opportunity.listingKind === 'job';
  const viewHref = isJob && opportunity.slug ? `/opportunities/${opportunity.slug}` : opportunity.sourceUrl;
  const viewExternal = !isJob;
  const visibleChips = chips.slice(0, compact ? 2 : 4);

  const logo = opportunity.companyLogoUrl ? (
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
  );

  const viewLink = (
    <a
      className={`${compact ? 'opportunity-match-link' : 'secondary-button on-light opportunity-view'}`}
      href={viewHref}
      {...(viewExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      View Opportunity
      <ExternalLink className="btn-icon" size={16} strokeWidth={2} aria-hidden="true" />
    </a>
  );

  if (compact) {
    return (
      <article className="opportunity-card is-compact">
        <div className="match-preview-score">
          {opportunity.match ? (
            <>
              <strong>{opportunity.match.score}%</strong>
              <span>{opportunity.match.label}</span>
            </>
          ) : (
            <span>Complete profile</span>
          )}
        </div>
        <div className="opportunity-body">
          <h3>
            {isJob && opportunity.slug ? (
              <a href={`/opportunities/${opportunity.slug}`}>{opportunity.title}</a>
            ) : (
              opportunity.title
            )}
          </h3>
          <p className="opportunity-platform">{opportunity.sourcePlatform}</p>
          {visibleChips.length ? (
            <ul className="opportunity-meta">
              {visibleChips.map((chip) => {
                const Icon = chip.icon;
                return (
                  <li key={chip.text}>
                    <Icon size={14} strokeWidth={2} aria-hidden="true" />
                    {chip.text}
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
        {viewLink}
      </article>
    );
  }

  return (
    <article className="opportunity-card">
      {logo}
      <div className="opportunity-body">
        <div className="opportunity-title-row">
          <h3>
            {isJob && opportunity.slug ? (
              <a href={`/opportunities/${opportunity.slug}`}>{opportunity.title}</a>
            ) : (
              opportunity.title
            )}
          </h3>
        </div>
        <p className="opportunity-platform">{opportunity.sourcePlatform}</p>
        <ul className="opportunity-meta">
          {visibleChips.map((chip) => {
            const Icon = chip.icon;
            return (
              <li key={chip.text}>
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
          <p className="opportunity-pay">
            <DollarSign size={14} strokeWidth={2} aria-hidden="true" />
            {opportunity.compensationText}
          </p>
        ) : null}
        <MatchBadge match={opportunity.match} returnTo={returnTo} />
        {viewLink}
      </div>
    </article>
  );
}
