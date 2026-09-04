'use client';

import { Bookmark, ExternalLink, PhoneCall } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { OpportunityMatch, PublicJob } from '../../lib/api';
import {
  formatCompensation,
  formatEmploymentType,
  formatJobLocation,
  formatPostedDate,
} from '../../lib/opportunityDisplay';
import { isJobSaved, SAVED_JOBS_EVENT, toggleSavedJob } from '../../lib/savedJobs';

export default function OpportunityApplySidebar({
  job,
  match,
}: {
  job: PublicJob;
  match?: OpportunityMatch | null;
}) {
  const [saved, setSaved] = useState(false);
  const location = formatJobLocation(job);
  const compensation = formatCompensation(job);
  const employment = formatEmploymentType(job.employmentType);
  const posted = formatPostedDate(job.postedAt);
  const origin = job.origin || 'External opportunity';

  useEffect(() => {
    function sync() {
      setSaved(isJobSaved(job.id));
    }
    sync();
    window.addEventListener(SAVED_JOBS_EVENT, sync);
    return () => window.removeEventListener(SAVED_JOBS_EVENT, sync);
  }, [job.id]);

  return (
    <aside className="opportunity-rail">
      <section className="opportunity-rail-card opportunity-apply-card">
        <p className="origin-badge">{origin}</p>
        <h2>Apply on employer site</h2>
        <p>Application is completed on the employer’s website. AI Trainers is not the employer for this listing.</p>
        <a className="primary-button opportunity-view" href={job.applyUrl} target="_blank" rel="noopener noreferrer">
          Apply on employer site
          <ExternalLink className="btn-icon" size={16} strokeWidth={2} />
        </a>
        <dl className="apply-facts">
          {location.label ? (
            <div>
              <dt>Location</dt>
              <dd>{location.label}</dd>
            </div>
          ) : null}
          {employment ? (
            <div>
              <dt>Employment type</dt>
              <dd>{employment}</dd>
            </div>
          ) : null}
          {compensation ? (
            <div>
              <dt>Compensation</dt>
              <dd>{compensation}</dd>
            </div>
          ) : null}
          {posted ? (
            <div>
              <dt>Date posted</dt>
              <dd>{posted}</dd>
            </div>
          ) : null}
          <div>
            <dt>Source</dt>
            <dd>{job.companyName}</dd>
          </div>
        </dl>
        {match && match.score > 0 ? (
          <p className="match-pill" data-band={match.score >= 80 ? 'strong' : match.score >= 70 ? 'good' : 'possible'}>
            <strong>{match.score}% match</strong>
            <span>{match.label}</span>
          </p>
        ) : null}
        <button
          type="button"
          className={`secondary-button on-light opportunity-view${saved ? ' is-saved' : ''}`}
          aria-pressed={saved}
          onClick={() => setSaved(toggleSavedJob(job.id))}
        >
          <Bookmark size={16} strokeWidth={2} fill={saved ? 'currentColor' : 'none'} aria-hidden="true" />
          {saved ? 'Saved' : 'Save job'}
        </button>
      </section>
      <section className="opportunity-rail-card">
        <h3>Need guidance?</h3>
        <p>Our coaching team can help you understand where your background fits and what to focus on next.</p>
        <a className="secondary-button on-light opportunity-view" href="/#apply">
          <PhoneCall size={16} strokeWidth={2} />
          Book a Free Intro Call
        </a>
      </section>
    </aside>
  );
}
