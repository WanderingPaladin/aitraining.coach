'use client';

import { useEffect } from 'react';
import { BookOpenCheck, ClipboardCheck, Medal, Sparkles, Timer } from 'lucide-react';
import { trackEvent } from '../../../lib/tracking';
import LearnShell from './LearnShell';

const chips = [
  { icon: Timer, label: 'About 60 minutes' },
  { icon: Sparkles, label: 'Beginner friendly' },
  { icon: BookOpenCheck, label: 'Interactive practice' },
  { icon: ClipboardCheck, label: 'Readiness assessment' },
  { icon: Medal, label: 'Certificate included' },
];

const steps = ['Learn', 'Practice', 'Assessment', 'Results', 'Certificate'];

const audience = [
  { title: 'I’m completely new', copy: 'You do not need prior AI-training experience to start.' },
  { title: 'I created accounts but feel stuck', copy: 'Learn how evaluation work actually gets judged before you spend more time guessing.' },
  { title: 'I passed onboarding but have little/no work', copy: 'Practice the skills platforms look for, then see a readiness score you can improve.' },
  { title: 'I want to explore without hours of research', copy: 'A structured hour that covers the basics, with optional coaching afterward.' },
];

export default function LearnLanding() {
  useEffect(() => {
    trackEvent({ eventType: 'course_viewed' });
  }, []);

  return (
    <LearnShell
      hero={
        <section className="learn-hero shell">
          <p className="journal-eyebrow">Free beginner course</p>
          <h1>AI Training Foundations</h1>
          <p className="journal-lead">
            Learn how AI-training work actually works, practice evaluating AI responses, test your readiness, and earn a certificate of completion.
          </p>
          <ul className="learn-chips">
            {chips.map((chip) => (
              <li key={chip.label}>
                <chip.icon size={16} strokeWidth={2} aria-hidden="true" />
                {chip.label}
              </li>
            ))}
          </ul>
          <div className="hero-actions learn-hero-actions">
            <a
              className="primary-button"
              href="/learn/ai-training-foundations/module/1"
              onClick={() => trackEvent({ eventType: 'course_started' })}
            >
              Start free course
            </a>
            <a className="secondary-button" href="/learn/ai-training-foundations">
              View course outline
            </a>
          </div>
          <ol className="learn-path" aria-label="Course path">
            {steps.map((step, index) => (
              <li key={step}>
                <span>{index + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </section>
      }
    >
      <div className="journal-light">
        <div className="shell journal-main">
          <section>
            <div className="section-heading compact">
              <h2>Is this course for you?</h2>
            </div>
            <div className="learn-audience">
              {audience.map((item) => (
                <article key={item.title} className="learn-audience-card">
                  <h3>{item.title}</h3>
                  <p>{item.copy}</p>
                </article>
              ))}
            </div>
            <p className="learn-disclaimer">
              This educational program does not guarantee employment, acceptance by third-party platforms, project availability, or income.
            </p>
          </section>
        </div>
      </div>
    </LearnShell>
  );
}
