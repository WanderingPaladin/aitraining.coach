import { ArrowRight } from 'lucide-react';
import type { Story } from '../../lib/stories';

export default function FeaturedStoryBanner({ story }: { story: Story }) {
  return (
    <section className="featured-journey shell">
      <p className="journal-eyebrow quiet">Think you need experience before talking to us?</p>
      <div className="featured-journey-card">
        <span className="journey-chip">{story.category}</span>
        <blockquote>
          “I thought I needed experience before talking to a coach.
          <br />
          The call was where I learned I didn’t.”
        </blockquote>
        <a className="primary-button" href={`/stories/${story.slug}`}>
          Read the Story <ArrowRight className="btn-icon" size={16} strokeWidth={2} />
        </a>
      </div>
    </section>
  );
}
