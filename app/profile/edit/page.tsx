import type { Metadata } from 'next';
import ProfileEditForm from '../../components/ProfileEditForm';
import SiteFooter from '../../components/SiteFooter';
import SiteHeader from '../../components/SiteHeader';

export const metadata: Metadata = {
  title: 'Edit profile | AI Trainers',
  robots: { index: false, follow: false },
};

export default function ProfileEditPage() {
  return (
    <main className="journal-page" id="top">
      <div className="journal-hero-wrap">
        <SiteHeader current="profile" />
        <section className="journal-hero profile-hero">
          <div className="hero-glow" />
          <div className="shell">
            <p className="journal-eyebrow">Edit profile</p>
            <h1>
              Keep your background
              <br />
              <span className="hero-hl">current.</span>
            </h1>
            <p className="journal-lead">
              Details from a verified application are reused here. Add skills and availability to improve Profile Match.
            </p>
          </div>
        </section>
      </div>
      <div className="journal-light">
        <div className="shell journal-main">
          <div className="auth-card profile-edit-card">
            <ProfileEditForm />
          </div>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
