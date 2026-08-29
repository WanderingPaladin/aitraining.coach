'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { getBlogPreviewStories } from '../../lib/stories';
import StoryCard from './StoryCard';

const blogCategories = [
  'All',
  'Success Stories',
  'AI Trainer Tips',
  'Career Growth',
] as const;

type BlogCategory = (typeof blogCategories)[number];

export default function BlogHome() {
  const [category, setCategory] = useState<BlogCategory>('Success Stories');
  const preview = getBlogPreviewStories();
  const showStories = category === 'All' || category === 'Success Stories';

  return (
    <div className="blog-body">
      <div className="journey-filters blog-filters" role="tablist" aria-label="Blog categories">
        {blogCategories.map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={category === item}
            className={item === 'Success Stories' ? (category === item ? 'is-active is-emphasis' : 'is-emphasis') : category === item ? 'is-active' : undefined}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {showStories ? (
        <section className="blog-stories-block">
          <p className="journal-eyebrow quiet">Real stories & common journeys</p>
          <h2>You’re Probably Not the Only One Feeling Stuck.</h2>
          <p className="blog-stories-lead">
            Explore stories about starting with zero experience, waiting for projects, struggling with assessments, changing careers, and learning how to work more confidently.
          </p>
          <p className="journey-disclosure">Illustrative coaching journeys based on common challenges faced by new AI trainers.</p>
          <div className="journey-grid">
            {preview.map((story) => (
              <StoryCard key={story.slug} story={story} />
            ))}
          </div>
          <a className="primary-button blog-all-cta" href="/stories">
            See All Stories <ArrowRight className="btn-icon" size={16} strokeWidth={2} />
          </a>
        </section>
      ) : (
        <section className="blog-empty">
          <p className="journal-eyebrow quiet">{category}</p>
          <h2>More pieces in this category are on the way.</h2>
          <p>
            We’re keeping this space for thoughtful writing — not filler. In the meantime, the coaching journeys are the most useful place to start.
          </p>
          <a className="secondary-button on-light" href="/stories">
            Read Success Stories <ArrowRight className="btn-icon" size={16} strokeWidth={2} />
          </a>
        </section>
      )}
    </div>
  );
}
