import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, Phone } from 'lucide-react';
import SiteFooter from '../../components/SiteFooter';
import SiteHeader from '../../components/SiteHeader';
import StoryConvertCta from '../../components/StoryConvertCta';
import StoryIdentityMark from '../../components/StoryIdentityMark';
import { getStory, ILLUSTRATIVE_DISCLOSURE, stories } from '../../../lib/stories';

type StoryPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return stories.map((story) => ({ slug: story.slug }));
}

export async function generateMetadata({ params }: StoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const story = getStory(slug);
  if (!story) {
    return { title: 'Story — AI Trainers' };
  }
  return {
    title: `${story.title} — AI Trainers`,
    description: story.preview,
  };
}

export default async function StoryPage({ params }: StoryPageProps) {
  const { slug } = await params;
  const story = getStory(slug);
  if (!story) {
    notFound();
  }

  const identityLabel = story.verified && story.name ? story.name : story.identity.label;

  return (
    <main className="journal-page story-page" id="top">
      <div className="journal-hero-wrap story-hero-wrap">
        <SiteHeader current="stories" />
        <header className="story-hero shell">
          <a className="story-back" href="/stories">
            <ArrowLeft size={16} strokeWidth={2} /> All stories
          </a>
          <p className="journal-eyebrow">{story.category}</p>
          <h1>{story.title}</h1>
          <blockquote className="story-open-quote">“{story.quote}”</blockquote>
          <div className="story-hero-meta">
            <span className="journey-identity">
              <StoryIdentityMark identity={story.identity} size="lg" />
              <span>
                <b>{identityLabel}</b>
                <small>{story.verified ? 'Verified coaching journey' : 'Coaching journey'}</small>
              </span>
            </span>
            {!story.verified && <p className="journey-disclosure">{ILLUSTRATIVE_DISCLOSURE}</p>}
          </div>
        </header>
      </div>

      <article className="story-article">
        <div className="shell story-article-inner">
          <section className="story-block">
            <h2>Before</h2>
            {story.sections.before.map((paragraph, index) => (
              <p key={`before-${index}`}>{paragraph}</p>
            ))}
          </section>

          <section className="story-block">
            <h2>The Turning Point</h2>
            {story.sections.turningPoint.map((paragraph, index) => (
              <p key={`turn-${index}`}>{paragraph}</p>
            ))}
          </section>

          <section className="story-block">
            <h2>What They Worked On</h2>
            <ul className="story-worked">
              {story.sections.workedOn.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="story-block">
            <h2>What Changed</h2>
            {story.sections.whatChanged.map((paragraph, index) => (
              <p key={`changed-${index}`}>{paragraph}</p>
            ))}
          </section>

          <section className="story-block story-thanks">
            <h2>Thank You</h2>
            <p>{story.sections.thankYou}</p>
          </section>

          <section className="story-takeaway">
            <p className="journal-eyebrow quiet">Takeaway</p>
            <p>{story.sections.takeaway}</p>
          </section>

          <aside className="story-founder">
            <p className="journal-eyebrow quiet">From Yoan</p>
            <blockquote>“{story.founderNote.quote}”</blockquote>
            <footer>
              <b>{story.founderNote.author}</b>
              <small>{story.founderNote.role}</small>
            </footer>
          </aside>
        </div>
      </article>

      <StoryConvertCta />

      <nav className="story-next shell" aria-label="More stories">
        <a className="secondary-button on-light" href="/stories">
          Explore more stories <ArrowRight className="btn-icon" size={16} strokeWidth={2} />
        </a>
        <a className="primary-button" href="/#apply">
          Book a Free Intro Call <Phone className="btn-icon" size={16} strokeWidth={2} />
        </a>
      </nav>

      <SiteFooter />
    </main>
  );
}
