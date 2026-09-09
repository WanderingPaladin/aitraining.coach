'use client';

import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  Circle,
  CircleDot,
  ClipboardCheck,
  Clock3,
  FlaskConical,
  GitCompare,
  MessageSquareText,
  ScanSearch,
} from 'lucide-react';
import landing from '../../../lib/learn/data/landing-copy-v2.json';
import course from '../../../lib/learn/data/course-v2.json';
import { ASSESSMENT_WEIGHTS, LEARN_PATH, MODULES, PASS_SCORE } from '../../../lib/learn/course';
import {
  completedModuleCount,
  courseJourneyStates,
  courseMinutes,
  coursePhase,
  getCoursePrimaryAction,
  nextIncompleteModule,
  progressPercent,
  type CoursePhase,
} from '../../../lib/learn/overview';
import { assessmentAction, practiceLabs } from '../../../lib/learn/sequence';
import { isLabComplete } from '../../../lib/learn/storage';
import { trackEvent } from '../../../lib/tracking';
import { useLearnProgress } from '../../hooks/useLearnProgress';
import LearnCertificatePreview from './LearnCertificatePreview';
import LearnCurriculum from './LearnCurriculum';
import LearnEvalPreview from './LearnEvalPreview';
import LearnShell from './LearnShell';

const SKILLS = [
  { icon: ScanSearch, title: 'Evaluate quality', body: course.landingOutcomes[1] },
  { icon: BadgeCheck, title: 'Verify factuality', body: course.landingOutcomes[3] },
  { icon: GitCompare, title: 'Compare responses', body: course.landingOutcomes[2] },
  { icon: MessageSquareText, title: 'Explain decisions', body: course.landingOutcomes[5] },
];

const LAB_COPY: Record<string, string> = {
  'constraint-detective': 'Spot instructions and hidden constraints.',
  'response-ranking': 'Compare responses and justify your choice.',
  'hallucination-spotter': 'Identify unsupported or inaccurate claims.',
};

function JourneyIcon({ status }: { status: 'complete' | 'current' | 'upcoming' }) {
  if (status === 'complete') return <CheckCircle2 size={18} strokeWidth={2} aria-hidden="true" />;
  if (status === 'current') return <CircleDot size={18} strokeWidth={2} aria-hidden="true" />;
  return <Circle size={18} strokeWidth={2} aria-hidden="true" />;
}

export default function LearnLanding() {
  const { state, ready } = useLearnProgress();
  const phase = coursePhase(state);
  const action = getCoursePrimaryAction(state);
  const assess = assessmentAction(state);
  const percent = progressPercent(state);
  const completed = completedModuleCount(state);
  const nextModule = nextIncompleteModule(state);
  const journey = courseJourneyStates(state);
  const labs = practiceLabs().slice(0, 3);
  const [faqOpen, setFaqOpen] = useState<string | null>(landing.faq[0]?.q ?? null);
  const faqs = landing.faq;

  useEffect(() => {
    trackEvent({ eventType: 'course_viewed' });
  }, []);

  function onPrimaryClick() {
    if (phase === 'not_started') trackEvent({ eventType: 'course_started' });
  }

  return (
    <LearnShell
      hero={
        <section className="learn-hero shell">
          <div className="learn-hero-grid">
            <div className="learn-hero-copy">
              <p className="journal-eyebrow">AI Training Foundations</p>
              <p className="learn-hero-badges">
                <span>Free</span>
                <span>Beginner</span>
              </p>
              <h1>Learn to evaluate AI responses with professional judgment.</h1>
              <p className="journal-lead">
                A practical course built around the skills used in AI evaluation work — instruction following, factuality,
                reasoning, ranking, safety, and response quality.
              </p>
              <ul className="learn-hero-meta">
                <li>
                  <BookOpen size={16} strokeWidth={2} aria-hidden="true" />
                  {MODULES.length} modules
                </li>
                <li>
                  <Clock3 size={16} strokeWidth={2} aria-hidden="true" />
                  ~{courseMinutes()} min
                </li>
                <li>
                  <FlaskConical size={16} strokeWidth={2} aria-hidden="true" />
                  Practice labs
                </li>
                <li>
                  <ClipboardCheck size={16} strokeWidth={2} aria-hidden="true" />
                  Final assessment
                </li>
                <li>
                  <Award size={16} strokeWidth={2} aria-hidden="true" />
                  Certificate
                </li>
              </ul>
              {ready && phase !== 'not_started' ? (
                <div className="learn-hero-progress">
                  <div className="learn-overview-progress-row">
                    <p>{phaseLabel(phase)}</p>
                    <b>{percent}%</b>
                  </div>
                  <div
                    className="learn-meter"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={percent}
                    aria-label={`${percent} percent complete`}
                  >
                    <i style={{ width: `${percent}%` }} />
                  </div>
                  <p>
                    {completed} of {MODULES.length} modules completed
                    {phase === 'in_progress' && nextModule ? ` · Next up: Module ${nextModule.n}` : ''}
                  </p>
                </div>
              ) : null}
              <div className="learn-hero-actions">
                {ready ? (
                  <a className="primary-button" href={action.href} onClick={onPrimaryClick}>
                    {action.label.replace(/\s*→$/, '')}
                    <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
                  </a>
                ) : (
                  <span className="primary-button is-disabled">Loading…</span>
                )}
                <a className="secondary-button" href="#curriculum">
                  View curriculum
                </a>
              </div>
            </div>
            <ol className="learn-journey" aria-label="Course path">
              {journey.map((step) => (
                <li key={step.label} className={`is-${step.status}`}>
                  <JourneyIcon status={step.status} />
                  <span>{step.label}</span>
                  <span className="learn-sr">
                    {step.status === 'complete' ? 'complete' : step.status === 'current' ? 'current' : 'upcoming'}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      }
    >
      <div className="journal-light">
        <div className="shell journal-main learn-product">
          <LearnEvalPreview action={action} />
          <LearnCurriculum state={state} ready={ready} />

          <section className="learn-section" aria-labelledby="learn-skills-title">
            <p className="learn-kicker">Skills you’ll build</p>
            <h2 id="learn-skills-title">The judgment this course practices</h2>
            <ul className="learn-skills">
              {SKILLS.map((item) => (
                <li key={item.title}>
                  <item.icon size={20} strokeWidth={2} aria-hidden="true" />
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="learn-section" aria-labelledby="learn-labs-title">
            <p className="learn-kicker">Practice labs</p>
            <h2 id="learn-labs-title">Practice before the final assessment.</h2>
            <p className="learn-lead">Optional labs. They do not affect your certificate score.</p>
            <ul className="learn-lab-preview">
              {labs.map((lab) => {
                const done = ready && isLabComplete(state, lab.id);
                return (
                  <li key={lab.id}>
                    <h3>{lab.title}</h3>
                    <p>{LAB_COPY[lab.id] ?? 'Apply the same evaluation skills on a realistic example.'}</p>
                    <a className="secondary-button on-light" href={LEARN_PATH.lab(lab.id)}>
                      {done ? 'Review' : 'Start lab'}
                      <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
                    </a>
                  </li>
                );
              })}
            </ul>
            <p>
              <a className="learn-text-btn" href={LEARN_PATH.practice}>
                View all practice labs
              </a>
            </p>
          </section>

          <section className="learn-section" aria-labelledby="learn-assess-title">
            <p className="learn-kicker">Final readiness assessment</p>
            <h2 id="learn-assess-title">See what you’re ready for — and what to improve.</h2>
            <p className="learn-lead">Complete the final assessment after finishing the course. Weighting below is how the score is composed, not a learner result.</p>
            <p className="learn-weight-label">Assessment weighting</p>
            <ul className="learn-weights">
              {ASSESSMENT_WEIGHTS.map((item) => (
                <li key={item.key}>
                  <div>
                    <span>{item.label}</span>
                    <b>{Math.round(item.weight * 100)}%</b>
                  </div>
                  <span className="learn-meter" aria-hidden="true">
                    <i style={{ width: `${item.weight * 100}%` }} />
                  </span>
                </li>
              ))}
            </ul>
            {ready && (phase === 'assessment_ready' || phase === 'assessment_in_progress' || phase === 'passed' || phase === 'failed') ? (
              <a className="primary-button" href={assess.href}>
                {assess.label.replace(/\s*→$/, '')}
                <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
              </a>
            ) : (
              <p className="learn-hint">Complete the course to unlock assessment</p>
            )}
          </section>

          <section className="learn-section learn-cert-section" aria-labelledby="learn-cert-title">
            <div className="learn-cert-copy">
              <p className="learn-kicker">Certificate of Completion</p>
              <h2 id="learn-cert-title">A record of this educational program</h2>
              <p className="learn-lead">
                Complete the course and meet the assessment requirement ({PASS_SCORE}/100) to earn an AI Trainers
                Certificate of Completion. Once earned, it is stored on your profile.
              </p>
              <p className="learn-weight-label">Earn this certificate by</p>
              <ul className="learn-cert-reqs">
                <li>Completing the course</li>
                <li>Passing the final assessment with {PASS_SCORE}/100 or higher</li>
              </ul>
              <ul className="learn-cert-points">
                <li>Completion record</li>
                <li>Assessment-backed</li>
                <li>Stored in your AI Trainers profile</li>
              </ul>
              {ready && phase === 'passed' && state.resultId ? (
                <a className="secondary-button on-light" href={LEARN_PATH.results(state.resultId)}>
                  View certificate
                  <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
                </a>
              ) : (
                <p className="learn-hint">
                  {phase === 'assessment_ready' || phase === 'assessment_in_progress' || phase === 'failed'
                    ? 'Pass the assessment requirement to earn it.'
                    : 'Complete the course to unlock the assessment, then earn the certificate.'}
                </p>
              )}
              <p className="learn-disclaimer">{course.disclaimer}</p>
            </div>
            <LearnCertificatePreview />
          </section>

          <section className="learn-section" aria-labelledby="learn-audience-title">
            <p className="learn-kicker">Built for wherever you’re starting</p>
            <h2 id="learn-audience-title">Who this course is for</h2>
            <div className="learn-audience">
              {landing.audiences.map((item) => (
                <article key={item.title} className="learn-audience-card">
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="learn-section learn-bridge" aria-labelledby="learn-bridge-title">
            <p className="learn-kicker">Build skills → understand your readiness → explore opportunities</p>
            <h2 id="learn-bridge-title">Put what you’ve learned into context.</h2>
            <p className="learn-lead">
              After building the fundamentals, explore current AI-training opportunities and compare them with your profile.
            </p>
            <a className="primary-button" href="/opportunities">
              Explore opportunities
              <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
            </a>
          </section>

          <section className="learn-section" aria-labelledby="learn-faq-title">
            <p className="learn-kicker">FAQ</p>
            <h2 id="learn-faq-title">Common questions</h2>
            <div className="learn-faq">
              {faqs.map((item, index) => {
                const expanded = faqOpen === item.q;
                const panelId = `learn-faq-${index}`;
                return (
                  <div key={item.q}>
                    <h3>
                      <button
                        type="button"
                        aria-expanded={expanded}
                        aria-controls={panelId}
                        onClick={() => setFaqOpen(expanded ? null : item.q)}
                      >
                        {item.q}
                      </button>
                    </h3>
                    <div id={panelId} hidden={!expanded}>
                      <p>{item.a}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="learn-section learn-final-cta" aria-labelledby="learn-end-title">
            <h2 id="learn-end-title">Ready to build your AI evaluation skills?</h2>
            <p className="learn-lead">Start with the foundations and progress at your own pace.</p>
            <div className="learn-hero-actions">
              {ready ? (
                <a className="primary-button" href={action.href} onClick={onPrimaryClick}>
                  {action.label.replace(/\s*→$/, '')}
                  <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
                </a>
              ) : (
                <span className="primary-button is-disabled">Loading…</span>
              )}
              <a className="secondary-button on-light" href="#curriculum">
                View curriculum
              </a>
            </div>
          </section>
        </div>
      </div>
    </LearnShell>
  );
}

function phaseLabel(phase: CoursePhase) {
  if (phase === 'passed') return 'Course complete';
  if (phase === 'failed') return 'Assessment completed';
  if (phase === 'assessment_in_progress') return 'Assessment in progress';
  if (phase === 'assessment_ready') return 'Ready for assessment';
  return 'Your progress';
}
