'use client';

import { useMemo, useState } from 'react';
import { filterStories, hasUnverifiedStories, storyFilters, type StoryFilter } from '../../lib/stories';
import BookIntroCallButton from './BookIntroCallButton';
import StoryCard from './StoryCard';

export default function StoryCatalog() {
  const [filter, setFilter] = useState<StoryFilter>('All Stories');
  const visible = useMemo(() => filterStories(filter), [filter]);
  const midIndex = Math.min(5, Math.max(3, Math.ceil(visible.length / 2)));
  const first = visible.slice(0, midIndex);
  const second = visible.slice(midIndex);
  const showDisclosure = hasUnverifiedStories(visible);

  return (
    <div className="journey-catalog" id="stories">
      <div className="journey-filters" role="tablist" aria-label="Filter stories">
        {storyFilters.map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={filter === item}
            className={filter === item ? 'is-active' : undefined}
            onClick={() => setFilter(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {showDisclosure && (
        <p className="journey-disclosure">Illustrative coaching journeys based on common challenges faced by new AI trainers.</p>
      )}

      {visible.length === 0 ? (
        <p className="journey-empty">No stories in this category yet.</p>
      ) : (
        <>
          <div className="journey-grid">
            {first.map((story) => (
              <StoryCard key={story.slug} story={story} />
            ))}
          </div>
          {second.length > 0 && (
            <aside className="journey-inline-cta">
              <h2>You Don’t Need a Success Story Before You Start.</h2>
              <p>
                Some people come to us with experience. Others come with nothing more than an eligible account and the willingness to learn. Both are valid starting points.
              </p>
              <BookIntroCallButton href="/#apply" />
            </aside>
          )}
          {second.length > 0 && (
            <div className="journey-grid">
              {second.map((story) => (
                <StoryCard key={story.slug} story={story} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
