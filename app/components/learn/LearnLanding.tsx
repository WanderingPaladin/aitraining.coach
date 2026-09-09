'use client';

import { useEffect } from 'react';
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Circle,
  CircleDot,
  ClipboardCheck,
  Clock3,
  Compass,
  Flag,
  FlaskConical,
  GitCompare,
  Map,
  MessageSquareText,
  PauseCircle,
  ScanSearch,
} from 'lucide-react';
import landing from '../../../lib/learn/data/landing-copy-v2.json';
import course from '../../../lib/learn/data/course-v2.json';
import { LEARN_PATH, MODULES, PASS_SCORE } from '../../../lib/learn/course';
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
import LearnAssessmentSection from './LearnAssessmentSection';
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

const LAB_PREVIEW = [
  { id: 'constraint-detective', icon: ScanSearch, body: 'Spot hidden requirements before judging an AI response.', kind: 'Practice' },
  { id: 'response-ranking', icon: GitCompare, body: 'Compare responses and justify your choice.', kind: 'Practice' },
  { id: 'hallucination-spotter', icon: Flag, body: 'Identify unsupported or inaccurate claims.', kind: 'Practice' },
];

const AUDIENCE_ICONS = [Compass, PauseCircle, Briefcase, Map];

function JourneyIcon({ status }: { status: 'complete' | 'current' | 'upcoming' }) {
  if (status === 'complete') return <CheckCircle2 size={18} strokeWidth={2} aria-hidden="true" />;
  if (status === 'current') return <CircleDot size={18} strokeWidth={2} aria-hidden="true" />;
  return <Circle size={18} strokeWidth={2} aria-hidden="true" />;
}

function ActionButton({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick?: () => void;
}) {
  return (
    <a className="primary-button" href={href} onClick={onClick}>
      {label.replace(/\s*→$/, '')}
      <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
    </a>
  );
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
  const labs = practiceLabs();

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
                  <ActionButton href={action.href} label={action.label} onClick={onPrimaryClick} />
                ) : (
                  <span className="learn-skel learn-skel-btn" aria-hidden="true" />
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

          <section className="learn-section learn-labs-section" aria-labelledby="learn-labs-title">
            <p className="learn-kicker">Practice labs</p>
            <h2 id="learn-labs-title">Practice before the final assessment.</h2>
            <p className="learn-lead">Optional labs. They do not affect your certificate score.</p>
            <ul className="learn-lab-preview">
              {LAB_PREVIEW.map((item) => {
                const lab = labs.find((entry) => item.id === entry.id);
                if (!lab) return null;
                const done = ready && isLabComplete(state, lab.id);
                return (
                  <li key={lab.id}>
                    <item.icon size={20} strokeWidth={2} aria-hidden="true" />
                    <h3>{lab.title}</h3>
                    <p>{item.body}</p>
                    <p className="learn-lab-meta">{item.kind}{done ? ' · Completed' : ''}</p>
                    <a className="secondary-button on-light" href={LEARN_PATH.lab(lab.id)}>
                      {done ? 'Practice again' : 'Start lab'}
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

          <LearnAssessmentSection
            phase={phase}
            ready={ready}
            completed={completed}
            courseAction={action}
            assess={assess}
          />

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
              {landing.audiences.map((item, index) => {
                const Icon = AUDIENCE_ICONS[index] ?? Compass;
                return (
                  <article key={item.title} className="learn-audience-card">
                    <Icon size={20} strokeWidth={2} aria-hidden="true" />
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="learn-section learn-bridge" aria-labelledby="learn-bridge-title">
            <p className="learn-kicker">You’ve built the foundation</p>
            <h2 id="learn-bridge-title">Learning is only the first step.</h2>
            <p className="learn-lead">
              Use your skills and assessment results to understand which AI-training opportunities may fit your background.
              Assessment scores do not predict third-party acceptance.
            </p>
            <div className="learn-hero-actions">
              <a className="primary-button" href="/opportunities">
                Explore opportunities
                <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
              </a>
              <a className="learn-text-btn" href="/#apply">
                Talk with a coach
              </a>
            </div>
          </section>

          <section className="learn-section learn-final-cta" aria-labelledby="learn-end-title">
            <h2 id="learn-end-title">
              {phase === 'passed'
                ? 'You’ve completed the foundations.'
                : phase === 'not_started'
                  ? 'Ready to start?'
                  : 'Continue where you left off.'}
            </h2>
            <p className="learn-lead">
              {phase === 'passed'
                ? 'Review your result, or explore opportunities that may match your background.'
                : phase === 'not_started'
                  ? `Build the fundamentals in about ${courseMinutes()} minutes and practice at your own pace.`
                  : 'Pick up the next module, lab, or assessment from where you stopped.'}
            </p>
            <div className="learn-hero-actions">
              {ready ? (
                phase === 'passed' && state.resultId ? (
                  <>
                    <a className="primary-button" href={LEARN_PATH.results(state.resultId)}>
                      View results
                      <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
                    </a>
                    <a className="secondary-button on-light" href="/opportunities">
                      Explore opportunities
                    </a>
                  </>
                ) : (
                  <ActionButton href={action.href} label={action.label} onClick={onPrimaryClick} />
                )
              ) : (
                <span className="learn-skel learn-skel-btn" aria-hidden="true" />
              )}
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
