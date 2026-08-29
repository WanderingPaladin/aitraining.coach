import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import BlogHome from '../components/BlogHome';
import SiteFooter from '../components/SiteFooter';
import SiteHeader from '../components/SiteHeader';
import { getFeaturedStory } from '../../lib/stories';

export const metadata: Metadata = {
  title: 'Blog — AI Trainers',
  description:
    'Stories and notes from the AI training journey: starting from zero, waiting for projects, and building confidence with coaching.',
};

export default function BlogPage() {
  const featured = getFeaturedStory();

  return (
    <main className="journal-page" id="top">
      <div className="journal-hero-wrap">
        <SiteHeader current="stories" />
        <section className="journal-hero blog-hero">
          <div className="hero-glow" />
          <div className="shell blog-hero-grid">
            <div className="journal-hero-copy">
              <p className="journal-eyebrow">Stories from the journey</p>
              <h1>
                Coaching Journeys,
                <br />
                Told With Care.
              </h1>
              <p className="journal-lead">
                A quieter place to read about the messy middle of AI training — the empty dashboards, the paused tabs, and the first conversations that made the work feel learnable.
              </p>
              <a className="primary-button" href="/stories">
                Read Success Stories <ArrowRight className="btn-icon" size={16} strokeWidth={2} />
              </a>
            </div>
            <a className="blog-feature-card" href={`/stories/${featured.slug}`}>
              <span className="journey-chip">Success Stories</span>
              <p className="journal-eyebrow quiet">Featured journey</p>
              <h2>{featured.title}</h2>
              <blockquote>“{featured.quote}”</blockquote>
              <span className="journey-card-link">
                Read the story
                <ArrowRight className="btn-icon" size={16} strokeWidth={2} />
              </span>
            </a>
          </div>
        </section>
      </div>
      <div className="journal-light">
        <div className="shell journal-main">
          <BlogHome />
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
