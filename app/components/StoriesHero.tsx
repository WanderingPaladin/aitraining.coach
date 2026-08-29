import { ArrowRight, Phone } from 'lucide-react';

const floatCards = [
  { quote: 'I had the account. I just didn’t know what to do next.', className: 'float-a' },
  { quote: 'I thought my finance background had nothing to do with AI.', className: 'float-b' },
  { quote: 'My dashboard was empty for weeks.', className: 'float-c' },
  { quote: 'I was afraid I’d fail another qualification.', className: 'float-d' },
];

export default function StoriesHero() {
  return (
    <section className="journal-hero">
      <div className="hero-glow" />
      <div className="journal-hero-grid shell">
        <div className="journal-hero-copy">
          <p className="journal-eyebrow">Real journeys. Real challenges.</p>
          <h1>
            Everyone Starts
            <br />
            <span className="hero-hl">Somewhere.</span>
          </h1>
          <p className="journal-lead">
            Starting AI training can feel confusing, especially when you have an account but no experience, no projects, or no idea what comes next. These stories show the kinds of challenges our coaching is designed to help people work through.
          </p>
          <p className="journal-reassure">You don’t need to have everything figured out before you talk to us.</p>
          <div className="hero-actions">
            <a className="primary-button" href="/#apply">
              Book a Free Intro Call <Phone className="btn-icon" size={16} strokeWidth={2} />
            </a>
            <a className="secondary-button" href="#stories">
              Explore the Stories <ArrowRight className="btn-icon" size={16} strokeWidth={2} />
            </a>
          </div>
        </div>

        <div className="journey-stage" aria-hidden="true">
          {floatCards.map((card) => (
            <article key={card.className} className={`journey-float ${card.className}`}>
              <p>“{card.quote}”</p>
            </article>
          ))}
          <div className="journey-core">
            <span className="brand-mark" aria-hidden="true"><i /><b /></span>
            <strong>AI Trainers</strong>
            <small>Coaching Journey</small>
            <ol>
              <li>Problem</li>
              <li>Coaching</li>
              <li>Progress</li>
              <li>Confidence</li>
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
