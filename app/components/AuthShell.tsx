import type { ReactNode } from 'react';
import SiteFooter from './SiteFooter';
import SiteHeader from './SiteHeader';

export default function AuthShell({
  title,
  copy,
  children,
}: {
  title: string;
  copy: string;
  children: ReactNode;
}) {
  return (
    <main className="journal-page auth-page" id="top">
      <div className="journal-hero-wrap">
        <SiteHeader />
        <section className="auth-hero">
          <div className="hero-glow" />
          <div className="shell auth-grid">
            <div className="auth-copy">
              <p className="journal-eyebrow">Your AI Trainers account</p>
              <h1>{title}</h1>
              <p className="journal-lead">{copy}</p>
              <div className="auth-benefits">
                <article>
                  <strong>See your opportunity matches</strong>
                  <p>A transparent profile match, not a hiring prediction.</p>
                </article>
                <article>
                  <strong>Save roles for later</strong>
                  <p>Bookmark external listings and come back when you are ready.</p>
                </article>
                <article>
                  <strong>Keep coaching progress together</strong>
                  <p>Link a verified application so you do not re-enter the same details.</p>
                </article>
              </div>
            </div>
            <div className="auth-card">{children}</div>
          </div>
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}
