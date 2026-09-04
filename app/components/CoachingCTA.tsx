import { PhoneCall } from 'lucide-react';

export default function CoachingCTA({ compact = false }: { compact?: boolean }) {
  return (
    <section className={`coaching-cta${compact ? ' is-compact' : ''}`}>
      <div>
        <p className="coaching-cta-kicker">Coaching</p>
        <h2>Not sure which opportunities fit your background?</h2>
        <p>Get personalized guidance from an AI Trainers coach.</p>
      </div>
      <a className="primary-button" href="/#apply">
        <PhoneCall className="btn-icon-lead" size={16} strokeWidth={2} />
        Book a Free Intro Call
      </a>
    </section>
  );
}
