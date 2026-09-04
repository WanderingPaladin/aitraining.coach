'use client';

import { ArrowRight, Laptop, MapPin } from 'lucide-react';
import type { Opportunity } from '../../lib/api';
import {
  formatEmploymentType,
  formatFreshness,
  formatJobLocation,
  jobSummary,
  matchChips,
} from '../../lib/opportunityDisplay';
import CompanyAvatar from './CompanyAvatar';
import SavedJobButton from './SavedJobButton';

export default function OpportunityCard({
  opportunity,
  compact = false,
}: {
  opportunity: Opportunity;
  compact?: boolean;
}) {
  const href = opportunity.listingKind === 'job' && opportunity.slug
    ? `/opportunities/${opportunity.slug}`
    : opportunity.sourceUrl;
  const external = opportunity.listingKind !== 'job';
  const location = formatJobLocation({
    location: opportunity.location,
    city: opportunity.city,
    state: opportunity.state,
    country: opportunity.country,
    remoteType: opportunity.remoteStatus,
  });
  const employment = formatEmploymentType(opportunity.employmentType);
  const summary = jobSummary(opportunity);
  const freshness = formatFreshness(opportunity.postedAt, opportunity.lastVerifiedAt);
  const origin = opportunity.origin || 'External opportunity';
  const chips = [
    location.label,
    employment,
    opportunity.category && opportunity.category !== 'General AI Training' ? opportunity.category : null,
  ].filter((item): item is string => Boolean(item));
  const visibleChips = chips.slice(0, compact ? 3 : 4);
  const match = opportunity.match && opportunity.match.score > 0 ? opportunity.match : null;
  const reasons = matchChips(match);

  return (
    <article className={`opportunity-card${compact ? ' is-compact' : ''}`}>
      <a
        className="opportunity-card-hit"
        href={href}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        <span className="sr-only">{opportunity.title} at {opportunity.sourcePlatform}</span>
      </a>
      <CompanyAvatar name={opportunity.sourcePlatform} logoUrl={opportunity.companyLogoUrl} size={compact ? 40 : 48} />
      <div className="opportunity-body">
        <div className="opportunity-title-row">
          <div>
            <h3>
              <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                {opportunity.title}
              </a>
            </h3>
            <p className="opportunity-platform">{opportunity.sourcePlatform}</p>
          </div>
          {match ? (
            <p className="match-pill" data-band={match.score >= 80 ? 'strong' : match.score >= 70 ? 'good' : 'possible'}>
              <strong>{match.score}% match</strong>
              <span>{match.label}</span>
            </p>
          ) : null}
        </div>
        {visibleChips.length ? (
          <ul className="opportunity-meta">
            {visibleChips.map((chip) => (
              <li key={chip}>
                {/remote|hybrid|on-site/i.test(chip) ? (
                  <Laptop size={14} strokeWidth={2} aria-hidden="true" />
                ) : chip === location.label && location.workplace !== 'Remote' ? (
                  <MapPin size={14} strokeWidth={2} aria-hidden="true" />
                ) : null}
                {chip}
              </li>
            ))}
          </ul>
        ) : null}
        {match && reasons.length ? (
          <ul className="match-skill-chips">
            {reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        ) : null}
        {opportunity.compensationText ? (
          <p className="opportunity-pay">{opportunity.compensationText}</p>
        ) : null}
        {freshness ? <p className="opportunity-freshness">{freshness}</p> : null}
        {!compact && summary ? <p className="opportunity-summary">{summary}</p> : null}
        <div className="opportunity-card-foot">
          <span className="origin-badge">{origin}</span>
          <span className="opportunity-match-link">
            View details
            <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
          </span>
        </div>
      </div>
      <SavedJobButton jobId={opportunity.id} title={opportunity.title} />
    </article>
  );
}
