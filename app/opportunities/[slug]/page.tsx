import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowLeft, BriefcaseBusiness, ExternalLink, Laptop, MapPin, PhoneCall } from 'lucide-react';
import SiteFooter from '../../components/SiteFooter';
import SiteHeader from '../../components/SiteHeader';
import {
  fetchPublicJobServer,
  formatJobSalary,
  jobPostingJsonLd,
  siteOrigin,
  type PublicJob,
} from '../../../lib/api';
import { siteIcons } from '../../../lib/siteIcons';

export const revalidate = 3600;

type JobPageProps = {
  params: Promise<{ slug: string }>;
};

function jobSummary(job: PublicJob) {
  return (job.descriptionText || job.title).replace(/\s+/g, ' ').trim().slice(0, 160);
}

export async function generateMetadata({ params }: JobPageProps): Promise<Metadata> {
  const { slug } = await params;
  const job = await fetchPublicJobServer(slug);
  if (!job) {
    return { title: 'Opportunity | AI Trainers', icons: siteIcons };
  }
  const description = jobSummary(job);
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
  const salary = formatJobSalary(job);
  const posted = job.postedAt
    ? new Date(job.postedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;
  const descriptionHtml = job.descriptionHtml?.trim();
  const descriptionText = job.descriptionText?.trim();

  return (
    <main className="journal-page" id="top">
      <div className="journal-hero-wrap">
        <SiteHeader current="opportunities" />
        <section className="journal-hero opportunities-hero opportunity-detail-hero">
          <div className="hero-glow" />
          <div className="shell journal-hero-copy">
            <a className="story-back" href="/opportunities">
              <ArrowLeft size={16} strokeWidth={2} />
              All opportunities
            </a>
            <p className="journal-eyebrow">{job.companyName}</p>
            <h1>{job.title}</h1>
            <ul className="opportunity-benefits opportunity-detail-meta">
              {job.location || job.remoteType ? (
                <li>
                  {job.remoteType === 'remote' ? <Laptop size={16} strokeWidth={2} aria-hidden="true" /> : <MapPin size={16} strokeWidth={2} aria-hidden="true" />}
                  {job.location || 'Remote'}
                </li>
              ) : null}
              {job.employmentType ? (
                <li>
                  <BriefcaseBusiness size={16} strokeWidth={2} aria-hidden="true" />
                  {job.employmentType.replace(/-/g, ' ')}
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
            <div className="hero-actions opportunities-hero-actions">
              <a className="primary-button" href={job.applyUrl} target="_blank" rel="noopener noreferrer">
                Apply on employer site
                <ExternalLink className="btn-icon" size={16} strokeWidth={2} />
              </a>
              <a className="secondary-button" href="/#apply">
                <PhoneCall className="btn-icon-lead" size={16} strokeWidth={2} />
                Book a Free Intro Call
              </a>
            </div>
          </div>
        </section>
      </div>
      <div className="journal-light">
        <div className="shell journal-main opportunities-layout">
          <article className="opportunity-detail-card">
            {job.companyLogoUrl ? (
              <img className="opportunity-logo" src={job.companyLogoUrl} alt="" width={48} height={48} />
            ) : (
              <span className="opportunity-letter-logo" aria-hidden="true">
                {job.companyName.slice(0, 1).toUpperCase()}
              </span>
            )}
            <div className="opportunity-body">
              <h2>About this role</h2>
              {descriptionHtml ? (
                <div className="job-description" dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
              ) : descriptionText ? (
                <div className="job-description">
                  {descriptionText.split(/\n{2,}/).map((paragraph) => (
                    <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                  ))}
                </div>
              ) : (
                <p className="opportunity-summary">Open the employer listing to read the full description.</p>
              )}
              <p className="opportunity-disclosure">
                AI Trainers is not the employer. This posting was collected from a public career page. Applications are
                submitted on the original apply URL.
              </p>
            </div>
          </article>
          <aside className="opportunity-rail">
            <section className="opportunity-rail-card">
              <h3>Apply with the employer</h3>
              <p>{job.companyName} hosts this listing. AI Trainers does not take applications for this role.</p>
              <a className="primary-button opportunity-view" href={job.applyUrl} target="_blank" rel="noopener noreferrer">
                Apply now
                <ExternalLink className="btn-icon" size={16} strokeWidth={2} />
              </a>
            </section>
            <section className="opportunity-rail-card">
              <h3>Need guidance?</h3>
              <p>Our coaching team can help you understand where your background fits and what to focus on next.</p>
              <a className="primary-button opportunity-view" href="/#apply">
                <PhoneCall size={16} strokeWidth={2} />
                Book a Free Intro Call
              </a>
            </section>
          </aside>
        </div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingJsonLd(job, canonical)) }} />
      <SiteFooter />
    </main>
  );
}
