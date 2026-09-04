import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowLeft, BriefcaseBusiness, ExternalLink, Laptop, MapPin } from 'lucide-react';
import OpportunityApplySidebar from '../../components/OpportunityApplySidebar';
import SiteFooter from '../../components/SiteFooter';
import SiteHeader from '../../components/SiteHeader';
import {
  fetchPublicJobServer,
  jobPostingJsonLd,
  siteOrigin,
  type PublicJob,
} from '../../../lib/api';
import {
  formatCompensation,
  formatEmploymentType,
  formatJobLocation,
  formatPostedDate,
  splitJobDescription,
} from '../../../lib/opportunityDisplay';
import { siteIcons } from '../../../lib/siteIcons';
import CompanyAvatar from '../../components/CompanyAvatar';

export const revalidate = 3600;

type JobPageProps = {
  params: Promise<{ slug: string }>;
};

function jobMetaSummary(job: PublicJob) {
  return (job.summary || job.descriptionText || job.title).replace(/\s+/g, ' ').trim().slice(0, 160);
}

export async function generateMetadata({ params }: JobPageProps): Promise<Metadata> {
  const { slug } = await params;
  const job = await fetchPublicJobServer(slug);
  if (!job) {
    return { title: 'Opportunity | AI Trainers', icons: siteIcons };
  }
  const description = jobMetaSummary(job);
  return {
    title: `${job.title} at ${job.companyName} | AI Trainers`,
    description,
    icons: siteIcons,
    openGraph: {
      title: `${job.title} at ${job.companyName}`,
      description,
      siteName: 'AI Trainers',
      type: 'article',
    },
  };
}

export default async function OpportunityJobPage({ params }: JobPageProps) {
  const { slug } = await params;
  const job = await fetchPublicJobServer(slug);
  if (!job) {
    notFound();
  }

  const canonical = `${siteOrigin()}/opportunities/${job.slug}`;
  const salary = formatCompensation(job);
  const posted = formatPostedDate(job.postedAt);
  const location = formatJobLocation(job);
  const employment = formatEmploymentType(job.employmentType);
  const sections = splitJobDescription(job.descriptionHtml, job.descriptionText);
  const origin = job.origin || 'External opportunity';

  return (
    <main className="journal-page" id="top">
      <div className="journal-hero-wrap">
        <SiteHeader current="opportunities" />
        <section className="journal-hero opportunities-hero opportunity-detail-hero">
          <div className="hero-glow" />
          <div className="shell journal-hero-copy">
            <a className="story-back" href="/opportunities">
              <ArrowLeft size={16} strokeWidth={2} />
              Back to opportunities
            </a>
            <p className="journal-eyebrow">{origin}</p>
            <h1>{job.title}</h1>
            <p className="opportunity-detail-company">{job.companyName}</p>
            <ul className="opportunity-benefits opportunity-detail-meta">
              {location.label ? (
                <li>
                  {location.workplace === 'Remote' ? (
                    <Laptop size={16} strokeWidth={2} aria-hidden="true" />
                  ) : (
                    <MapPin size={16} strokeWidth={2} aria-hidden="true" />
                  )}
                  {location.label}
                </li>
              ) : null}
              {employment ? (
                <li>
                  <BriefcaseBusiness size={16} strokeWidth={2} aria-hidden="true" />
                  {employment}
                </li>
              ) : null}
              {job.category ? (
                <li>
                  <BriefcaseBusiness size={16} strokeWidth={2} aria-hidden="true" />
                  {job.category}
                </li>
              ) : null}
              {posted ? <li>Posted {posted}</li> : null}
              {salary ? <li>{salary}</li> : null}
            </ul>
          </div>
        </section>
      </div>
      <div className="journal-light">
        <div className="shell journal-main opportunities-layout is-detail">
          <article className="opportunity-detail-card">
            <CompanyAvatar name={job.companyName} logoUrl={job.companyLogoUrl} />
            <div className="opportunity-body">
              {sections.length ? (
                sections.map((section) => (
                  <section key={`${section.id}-${section.title}`} className="job-section">
                    <h2>{section.title}</h2>
                    <div className="job-description" dangerouslySetInnerHTML={{ __html: section.html }} />
                  </section>
                ))
              ) : (
                <section className="job-section">
                  <h2>Employer-provided description</h2>
                  <p className="opportunity-summary">The employer did not include a public description for this listing.</p>
                </section>
              )}
              <p className="opportunity-disclosure">
                External opportunity. AI Trainers is not the employer. This posting was collected from a public career
                page. Application is completed on the employer’s website.
              </p>
            </div>
          </article>
          <OpportunityApplySidebar job={job} match={job.match} />
        </div>
      </div>
      <div className="opportunity-mobile-apply">
        <a className="primary-button" href={job.applyUrl} target="_blank" rel="noopener noreferrer">
          Apply on employer site
          <ExternalLink className="btn-icon" size={16} strokeWidth={2} />
        </a>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingJsonLd(job, canonical)) }} />
      <SiteFooter />
    </main>
  );
}
