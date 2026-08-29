import { ArrowRight, Phone } from 'lucide-react';

export default function StoryConvertCta() {
  return (
    <section className="story-convert">
      <div className="shell story-convert-inner">
        <h2>Does This Feel Familiar?</h2>
        <p>
          You don’t need to solve everything before talking to us. Whether you’re starting from zero, waiting for projects, or struggling to gain momentum, we can help you understand what to work on next.
        </p>
        <div className="hero-actions">
          <a className="primary-button" href="/#apply">
            Book a Free Intro Call <Phone className="btn-icon" size={16} strokeWidth={2} />
          </a>
          <a className="secondary-button" href="/#apply">
            Apply Now <ArrowRight className="btn-icon" size={16} strokeWidth={2} />
          </a>
        </div>
        <p className="story-convert-note">Currently available to eligible U.S.-based participants.</p>
      </div>
    </section>
  );
}
