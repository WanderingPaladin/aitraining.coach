import { ArrowRight } from 'lucide-react';
import type { Story } from '../../lib/stories';
import StoryIdentityMark from './StoryIdentityMark';

export default function StoryCard({
  story,
  featured = false,
}: {
  story: Story;
  featured?: boolean;
}) {
  return (
    <a className={featured ? 'journey-card is-featured' : 'journey-card'} href={`/stories/${story.slug}`}>
      <div className="journey-card-top">
        <span className="journey-chip">{story.category}</span>
        {!story.verified && <span className="journey-chip quiet">Illustrative journey</span>}
      </div>
      <blockquote className="journey-card-quote">“{story.quote}”</blockquote>
      <h3>{story.title}</h3>
      <p className="journey-card-preview">{story.preview}</p>
      <div className="journey-card-foot">
        <span className="journey-identity">
          <StoryIdentityMark identity={story.identity} />
          <span>
            <b>{story.verified && story.name ? story.name : story.identity.label}</b>
            {story.verified && story.results ? <small>{story.results}</small> : <small>Coaching journey</small>}
          </span>
        </span>
        <span className="journey-card-link">
          Read the full story
          <ArrowRight className="btn-icon" size={16} strokeWidth={2} />
        </span>
      </div>
    </a>
  );
}
