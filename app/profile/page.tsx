import type { Metadata } from 'next';
import ProfileView from '../components/ProfileView';
import SiteFooter from '../components/SiteFooter';
import SiteHeader from '../components/SiteHeader';

export const metadata: Metadata = {
  title: 'Your profile | AI Trainers',
  robots: { index: false, follow: false },
};

export default function ProfilePage() {
  return (
    <main className="journal-page" id="top">
      <div className="journal-hero-wrap">
        <SiteHeader current="profile" />
        <section className="journal-hero profile-hero">
          <div className="hero-glow" />
          <div className="shell">
            <p className="journal-eyebrow">Your AI training profile</p>
            <h1>
              See how your background
              <br />
              <span className="hero-hl">aligns with opportunities.</span>
            </h1>
            <p className="journal-lead">
              See how your professional background aligns with current AI-training opportunities and what you can improve next.
            </p>
          </div>
        </section>
      </div>
      <div className="journal-light">
        <div className="shell journal-main">
          <ProfileView />
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
