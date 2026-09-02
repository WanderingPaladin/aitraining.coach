import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ArrowDown, ExternalLink, GraduationCap, Laptop, PhoneCall, Target } from 'lucide-react';
import OpportunitiesBoard from '../components/OpportunitiesBoard';
import SiteFooter from '../components/SiteFooter';
import SiteHeader from '../components/SiteHeader';
import { trainingPlatforms } from '../../lib/platforms';
import { siteIcons } from '../../lib/siteIcons';

export const metadata: Metadata = {
  title: 'AI Training Opportunities | AI Trainers',
  description:
    'Explore AI-training opportunities across professional domains and discover roles that may align with your background.',
  icons: siteIcons,
};

const benefits = [
  { icon: GraduationCap, label: 'Beginner-friendly roles' },
  { icon: Laptop, label: 'Remote opportunities' },
  { icon: Target, label: 'Profile matching' },
];

export default function OpportunitiesPage() {
  return (
    <main className="journal-page" id="top">
      <div className="journal-hero-wrap">
        <SiteHeader current="opportunities" />
        <section className="journal-hero opportunities-hero">
          <div className="hero-glow" />
          <div className="journal-hero-grid shell opportunities-hero-grid">
            <div className="journal-hero-copy">
              <p className="journal-eyebrow">AI training opportunities</p>
              <h1>
                Find AI Training
                <br />
                <span className="hero-hl">Opportunities That Fit You.</span>
              </h1>
              <p className="journal-lead">
                Browse real AI-training opportunities across leading platforms, then use your profile to understand which roles align best with your background and skills.
              </p>
              <div className="hero-actions opportunities-hero-actions">
                <a className="primary-button" href="#listings">
                  Browse Opportunities
                  <ArrowDown className="btn-icon" size={16} strokeWidth={2} />
                </a>
                <a className="secondary-button" href="/#apply">
                  <PhoneCall className="btn-icon-lead" size={16} strokeWidth={2} />
                  Book a Free Intro Call
                </a>
              </div>
              <ul className="opportunity-benefits">
                {benefits.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.label}>
                      <Icon size={16} strokeWidth={2} aria-hidden="true" />
                      {item.label}
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="opportunities-hero-visual">
              <img
                className="job-board-orbit"
                src="/illustrations/job-board-orbit.svg"
                alt=""
                aria-hidden="true"
              />
              <div className="opportunities-hero-card">
                <img
                  src="/illustrations/opportunities-hero-illustration.svg"
                  alt=""
                />
              </div>
              <div className="platform-dock opp-platform-row">
                <p className="platform-dock-label">Explore AI Training Platforms</p>
                <div className="platform-dock-row">
                  {trainingPlatforms.map((platform) => (
                    <a
                      key={platform.name}
                      className="platform-card"
                      href={platform.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${platform.name} (opens in a new tab)`}
                      data-platform={platform.name}
                    >
                      <img src={platform.src} alt="" />
                      <span className="platform-card-name">{platform.name}</span>
                      <ExternalLink className="platform-card-link-icon" size={13} strokeWidth={2} aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <div className="journal-light" id="listings">
        <div className="shell journal-main">
          <Suspense fallback={<div className="opportunity-skeleton-list" aria-hidden="true"><div className="opportunity-card is-skeleton" /><div className="opportunity-card is-skeleton" /><div className="opportunity-card is-skeleton" /></div>}>
            <OpportunitiesBoard />
          </Suspense>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
