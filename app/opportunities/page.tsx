import type { Metadata } from 'next';
import { Suspense } from 'react';
import BookIntroCallButton from '../components/BookIntroCallButton';
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

export default function OpportunitiesPage() {
  return (
    <main className="journal-page" id="top">
      <div className="journal-hero-wrap">
        <SiteHeader current="opportunities" />
        <section className="journal-hero">
          <div className="hero-glow" />
          <div className="journal-hero-grid shell">
            <div className="journal-hero-copy">
              <p className="journal-eyebrow">AI training opportunities</p>
              <h1>
                Find AI Training Opportunities
                <br />
                <span className="hero-hl">That Fit Your Background.</span>
              </h1>
              <p className="journal-lead">
                Explore current AI-training opportunities across leading platforms and discover which roles align with your professional experience.
              </p>
              <div className="hero-actions">
                <a className="primary-button" href="#listings">
                  Browse Opportunities
                </a>
                <BookIntroCallButton className="secondary-button" href="/#apply" />
              </div>
              <ul className="opportunity-chips">
                <li>Beginner-friendly roles</li>
                <li>Remote opportunities</li>
                <li>Multiple professional backgrounds</li>
              </ul>
            </div>
            <div className="platform-dock opportunities-hero-platforms">
              <p className="platform-dock-label">Explore opportunities across AI-training platforms</p>
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
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
      <div className="journal-light" id="listings">
        <div className="shell journal-main">
          <Suspense fallback={<p className="opportunity-empty">Loading opportunities…</p>}>
            <OpportunitiesBoard />
          </Suspense>
        </div>
      </div>
      <section className="story-convert">
        <div className="shell story-convert-inner">
          <h2>Not sure which opportunities fit you?</h2>
          <p>Our coaching team can review your background and help you build a clearer path forward.</p>
          <div className="hero-actions">
            <BookIntroCallButton href="/#apply" />
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
