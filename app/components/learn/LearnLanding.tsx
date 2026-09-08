'use client';

import { useEffect, useState } from 'react';
import { BookOpenCheck, ClipboardCheck, Layers, Medal, Sparkles, Timer } from 'lucide-react';
import landing from '../../../lib/learn/data/landing-copy-v2.json';
import course from '../../../lib/learn/data/course-v2.json';
import { MODULES } from '../../../lib/learn/course';
import { trackEvent } from '../../../lib/tracking';
import LearnShell from './LearnShell';

const chips = [
  { icon: Timer, label: landing.hero.badges[0] },
  { icon: Sparkles, label: landing.hero.badges[1] },
  { icon: Layers, label: landing.hero.badges[2] },
  { icon: BookOpenCheck, label: landing.hero.badges[3] },
  { icon: ClipboardCheck, label: landing.hero.badges[4] },
  { icon: Medal, label: landing.hero.badges[5] },
];

const sample = {
  prompt: 'Give me three inexpensive vegetarian dinner ideas.',
  a: '1. Chicken tacos\n2. Vegetable pasta\n3. Lentil soup',
  b: '1. Bean chili\n2. Vegetable pasta\n3. Lentil soup',
};

export default function LearnLanding() {
  const [choice, setChoice] = useState<'A' | 'B' | null>(null);
  useEffect(() => {
    trackEvent({ eventType: 'course_viewed' });
  }, []);

  return (
    <LearnShell
      hero={
        <section className="learn-hero shell">
          <p className="journal-eyebrow">{landing.hero.eyebrow}</p>
          <h1>{landing.hero.title}</h1>
          <p className="journal-lead">{landing.hero.body}</p>
          <ul className="learn-chips">
            {chips.map((chip) => (
              <li key={chip.label}>
                <chip.icon size={16} strokeWidth={2} aria-hidden="true" />
                {chip.label}
              </li>
            ))}
          </ul>
          <div className="hero-actions learn-hero-actions">
            <a className="primary-button" href="/learn/ai-training-foundations/module/1" onClick={() => trackEvent({ eventType: 'course_started' })}>
              Start free course
            </a>
            <a className="secondary-button" href="#curriculum">
              View curriculum
            </a>
          </div>
          <p className="learn-hero-note">Optional practice labs are available after the core lessons.</p>
          <ol className="learn-path" aria-label="Course path">
            {course.journey.map((step, index) => (
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
        <div className="shell journal-main learn-landing-main">
          <section>
            <div className="section-heading compact">
              <h2>Is this course for you?</h2>
            </div>
            <div className="learn-audience">
              {landing.audiences.map((item) => (
                <article key={item.title} className="learn-audience-card">
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </section>
          <section>
            <div className="section-heading compact">
              <h2>What you’ll be able to do</h2>
            </div>
            <ul className="learn-list">
              {course.landingOutcomes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
          <section id="curriculum">
            <div className="section-heading compact">
              <h2>Curriculum preview</h2>
            </div>
            <ol className="learn-module-list">
              {MODULES.map((item) => (
                <li key={item.n} className="learn-module-card">
                  <div>
                    <span className="learn-module-num">{String(item.n).padStart(2, '0')}</span>
                    <h3>{item.title}</h3>
                    <p>{item.minutes}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
          <section>
            <div className="section-heading compact">
              <h2>Try a sample evaluation</h2>
            </div>
            <p className="learn-lead">Prompt: {sample.prompt}</p>
            <div className="learn-compare-grid">
              {(['A', 'B'] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  className={`learn-compare-card${choice === key ? (key === 'B' ? ' is-correct' : ' is-wrong') : ''}`}
                  onClick={() => setChoice(key)}
                >
                  <strong>Response {key}</strong>
                  <span style={{ whiteSpace: 'pre-wrap' }}>{key === 'A' ? sample.a : sample.b}</span>
                </button>
              ))}
            </div>
            {choice ? (
              <p className={`learn-feedback ${choice === 'B' ? 'is-ok' : 'is-no'}`} role="status">
                {choice === 'B' ? 'Correct. ' : 'The stronger choice is Response B. '}
                Chicken violates the vegetarian requirement even when the rest looks polished.
              </p>
            ) : (
              <p className="learn-hint">Choose the stronger response.</p>
            )}
          </section>
          <section>
            <div className="section-heading compact">
              <h2>What the readiness assessment measures</h2>
            </div>
            <ul className="learn-list">
              <li>Instruction following (25%)</li>
              <li>Response evaluation (25%)</li>
              <li>Factuality and research judgment (20%)</li>
              <li>Written reasoning (20%)</li>
              <li>Attention to detail (10%)</li>
            </ul>
          </section>
          <section>
            <div className="section-heading compact">
              <h2>Certificate of Completion</h2>
            </div>
            <p className="learn-lead">
              Earn an AITrainers.coach Certificate of Completion with a score of 75 or higher. It confirms this educational program only — not third-party accreditation or employment.
            </p>
          </section>
          <section>
            <div className="section-heading compact">
              <h2>Opportunities and coaching</h2>
            </div>
            <p>
              After the course you can explore current AI-training opportunities and, if you want help interpreting your results, book the same intro call used elsewhere on the site.
            </p>
          </section>
          <section>
            <div className="section-heading compact">
              <h2>FAQ</h2>
            </div>
            <dl className="learn-faq">
              {landing.faq.map((item) => (
                <div key={item.q}>
                  <dt>{item.q}</dt>
                  <dd>{item.a}</dd>
                </div>
              ))}
            </dl>
          </section>
          <p className="learn-inline-cta">
            <a className="primary-button" href="/learn/ai-training-foundations/module/1" onClick={() => trackEvent({ eventType: 'course_started' })}>
              Start free course
            </a>
          </p>
          <p className="learn-disclaimer">{course.disclaimer}</p>
        </div>
      </div>
    </LearnShell>
  );
}
