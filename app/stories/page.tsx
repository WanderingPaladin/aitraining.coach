import type { Metadata } from 'next';
import FeaturedStoryBanner from '../components/FeaturedStoryBanner';
import SiteFooter from '../components/SiteFooter';
import SiteHeader from '../components/SiteHeader';
import StoriesHero from '../components/StoriesHero';
import StoryCatalog from '../components/StoryCatalog';
import StoryConvertCta from '../components/StoryConvertCta';
import { getFeaturedStory } from '../../lib/stories';

export const metadata: Metadata = {
  title: 'Success Stories — AI Trainers',
  description:
    'Coaching journeys about starting from zero, waiting for projects, struggling with assessments, and building confidence in AI training.',
};

export default function SuccessStoriesPage() {
  const featured = getFeaturedStory();

  return (
    <main className="journal-page" id="top">
      <div className="journal-hero-wrap">
        <SiteHeader current="stories" />
        <StoriesHero />
      </div>
      <div className="journal-light">
        <FeaturedStoryBanner story={featured} />
        <div className="shell journal-main">
          <StoryCatalog />
        </div>
      </div>
      <StoryConvertCta />
      <SiteFooter />
    </main>
  );
}
