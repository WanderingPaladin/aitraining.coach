import type { Metadata } from 'next';
import SavedOpportunitiesList from '../components/SavedOpportunitiesList';
import SiteFooter from '../components/SiteFooter';
import SiteHeader from '../components/SiteHeader';

export const metadata: Metadata = {
  title: 'Saved opportunities | AI Trainers',
  robots: { index: false, follow: false },
};

export default function SavedOpportunitiesPage() {
  return (
    <main className="journal-page" id="top">
      <div className="journal-hero-wrap">
        <SiteHeader current="opportunities" />
        <section className="journal-hero profile-hero">
          <div className="hero-glow" />
          <div className="shell">
            <p className="journal-eyebrow">Saved opportunities</p>
            <h1>
              Roles you want
              <br />
              <span className="hero-hl">to revisit.</span>
            </h1>
            <p className="journal-lead">Bookmarks stay private to your account and still open the original platform listing.</p>
          </div>
        </section>
      </div>
      <div className="journal-light">
        <div className="shell journal-main">
          <SavedOpportunitiesList />
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
