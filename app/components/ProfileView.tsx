'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bookmark,
  CheckCircle2,
  Circle,
  CircleHelp,
  Pencil,
  Sparkles,
  Target,
} from 'lucide-react';
import {
  ApiError,
  getAccountProfile,
  listAccountActivity,
  listOpportunities,
  listSavedOpportunities,
  resendVerification,
  type AccountActivity,
  type AccountProfile,
  type Opportunity,
  type ReadinessScore,
} from '../../lib/api';
import { useAuth } from './AuthProvider';
import BookIntroCallButton from './BookIntroCallButton';
import OpportunityCard from './OpportunityCard';

const STAGE_LABELS: Record<string, string> = {
  new_no_account: 'Beginner',
  has_accounts_no_time: 'Has platform accounts',
  working_no_progress: 'Active AI Trainer',
};

function initials(profile: AccountProfile, email: string): string {
  const first = profile.firstName.trim();
  const last = profile.lastName.trim();
  if (first || last) {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || first.slice(0, 2).toUpperCase();
  }
  return (email.split('@')[0] ?? 'U').slice(0, 2).toUpperCase();
}

function isSparseProfile(profile: AccountProfile): boolean {
  return (
    !profile.firstName &&
    !profile.profession &&
    profile.skills.length === 0 &&
    profile.specialties.length === 0 &&
    !profile.yearsDomainExperience &&
    !profile.weeklyAvailability
  );
}

function strongestSignals(profile: AccountProfile): string[] {
  const signals: string[] = [];
  if (profile.profession) signals.push(profile.profession);
  if (profile.yearsDomainExperience) {
    signals.push(
      `${profile.yearsDomainExperience} year${profile.yearsDomainExperience === 1 ? '' : 's'} professional experience`,
    );
  }
  if (profile.specialties[0]) signals.push(profile.specialties[0]);
  if (profile.usEligibilityConfirmed) signals.push('U.S.-based');
  if (profile.weeklyAvailability) signals.push(`${profile.weeklyAvailability} availability`);
  if (profile.remotePreference) signals.push(profile.remotePreference);
  if (profile.platformsJoined.length) {
    signals.push(
      profile.platformsJoined.length === 1
        ? profile.platformsJoined[0]
        : `${profile.platformsJoined.length} platforms`,
    );
  }
  if (profile.languages.length) signals.push(profile.languages.slice(0, 2).join(', '));
  return [...new Set(signals)].slice(0, 5);
}

function joinValues(values: string[]): string {
  return values.filter(Boolean).join(', ');
}

export default function ProfileView() {
  const router = useRouter();
  const { user, loading, refresh } = useAuth();
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [readiness, setReadiness] = useState<ReadinessScore | null>(null);
  const [canScore, setCanScore] = useState(false);
  const [matches, setMatches] = useState<Opportunity[]>([]);
  const [saved, setSaved] = useState<Opportunity[]>([]);
  const [activity, setActivity] = useState<AccountActivity[]>([]);
  const [applications, setApplications] = useState<Array<{ id: string; status: string }>>([]);
  const [error, setError] = useState('');
  const [verifyNotice, setVerifyNotice] = useState('');
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login?returnTo=/profile');
      return;
    }
    let cancelled = false;
    setLoadingData(true);
    void Promise.all([
      getAccountProfile(),
      listOpportunities({ sort: 'match', limit: 3 }),
      listSavedOpportunities(),
      listAccountActivity(),
    ])
      .then(([account, opportunityResult, savedResult, activityResult]) => {
        if (cancelled) return;
        setProfile(account.profile);
        setReadiness(account.readiness);
        setCanScore(account.canScoreMatch);
        setApplications(account.applications ?? []);
        setMatches(opportunityResult.opportunities.slice(0, 3));
        setSaved(savedResult.opportunities.slice(0, 3));
        setActivity(activityResult.activity);
        setLoadingData(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          router.replace('/login?returnTo=/profile');
          return;
        }
        setError(err instanceof Error ? err.message : 'Could not load your profile.');
        setLoadingData(false);
      });
    return () => {
      cancelled = true;
    };
  }, [loading, user, router]);

  if (loading || !user || loadingData || !profile || !readiness) {
    return (
      <div className="profile-layout" aria-busy="true">
        {error ? <p className="opportunity-error">{error}</p> : null}
        <div className="profile-main-card is-skeleton" />
        <div className="profile-panel is-skeleton" />
        <div className="opportunity-skeleton-list" aria-hidden="true">
          <div className="opportunity-card is-skeleton is-compact" />
          <div className="opportunity-card is-skeleton is-compact" />
          <div className="opportunity-card is-skeleton is-compact" />
        </div>
      </div>
    );
  }

  const name = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || user.email;
  const location = [profile.city, profile.state].filter(Boolean).join(', ');
  const identityLine = [profile.profession, location].filter(Boolean).join(' · ');
  const hints = readiness.components.filter((item) => item.hint).map((item) => item.hint!);
  const signals = strongestSignals(profile);
  const sparse = isSparseProfile(profile);
  const booked = applications.some((item) => ['booked', 'reviewed', 'advanced'].includes(item.status));
  const coaching = applications.some((item) => ['reviewed', 'advanced'].includes(item.status));
  const statusTags = [
    profile.applicantStage ? STAGE_LABELS[profile.applicantStage] : null,
    profile.platformStatus === 'active' ? 'Active AI Trainer' : null,
    profile.usEligibilityConfirmed ? 'U.S. Eligible' : null,
  ].filter((value, index, list): value is string => Boolean(value) && list.indexOf(value) === index);

  const journey = [
    { label: 'Profile Created', done: true },
    { label: 'Profile Completed', done: canScore },
    { label: 'Application Submitted', done: applications.length > 0 },
    { label: 'Intro Call Booked', done: booked },
    { label: 'Saved Opportunities', done: saved.length > 0 },
    { label: 'Coaching Started', done: coaching },
  ];

  if (sparse) {
    return (
      <div className="profile-layout">
        {!user.emailVerified ? (
          <div className="verify-banner">
            <p>Verify your email to link an existing application and keep your coaching history together.</p>
            <button
              type="button"
              className="secondary-button on-light"
              onClick={async () => {
                await resendVerification();
                await refresh();
                setVerifyNotice('Verification email sent.');
              }}
            >
              Resend verification
            </button>
            {verifyNotice ? <small>{verifyNotice}</small> : null}
          </div>
        ) : null}
        <section className="profile-empty-card">
          <h2>Build Your AI Training Profile</h2>
          <p>
            Tell us about your professional background so we can identify opportunities that may fit your experience.
          </p>
          <a className="primary-button" href="/profile/edit">
            Complete Your Profile
          </a>
          <ul className="profile-empty-benefits">
            <li>See personalized opportunity matches</li>
            <li>Understand where your background fits</li>
            <li>Discover more relevant opportunities</li>
          </ul>
        </section>
      </div>
    );
  }

  return (
    <div className="profile-layout">
      {!user.emailVerified ? (
        <div className="verify-banner">
          <p>Verify your email to link an existing application and keep your coaching history together.</p>
          <button
            type="button"
            className="secondary-button on-light"
            onClick={async () => {
              await resendVerification();
              await refresh();
              setVerifyNotice('Verification email sent.');
            }}
          >
            Resend verification
          </button>
          {verifyNotice ? <small>{verifyNotice}</small> : null}
        </div>
      ) : null}

      <section className="profile-main-card">
        <div className="profile-identity">
          <div className="profile-avatar" aria-hidden="true">
            {initials(profile, user.email)}
          </div>
          <div>
            <h2>{name}</h2>
            <p>{identityLine || 'Add your background to personalize matches.'}</p>
            {statusTags.length ? (
              <ul className="profile-status-tags">
                {statusTags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            ) : null}
            <div className="profile-identity-actions">
              <a className="primary-button" href="/opportunities?sort=match">
                <Target size={16} strokeWidth={2} aria-hidden="true" />
                View My Matches
              </a>
              <a className="secondary-button on-light" href="/profile/edit">
                <Pencil size={16} strokeWidth={2} aria-hidden="true" />
                Edit Profile
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="profile-panel readiness-card">
        <div className="profile-section-head">
          <h3>AI Training Readiness</h3>
        </div>
        <div className="readiness-meter">
          <strong>{Math.min(100, readiness.score)}%</strong>
          <div className="readiness-track" aria-hidden="true">
            <i style={{ width: `${Math.min(100, readiness.score)}%` }} />
          </div>
        </div>
        <p className="match-disclaimer">AI Training Readiness measures how complete and prepared your profile is. It is not a Profile Match for a specific opportunity, and it is not a chance of being hired.</p>
        {hints.length ? (
          <div className="improve-block">
            <p>Improve your profile:</p>
            <ul className="improve-list">
              {hints.slice(0, 3).map((hint) => (
                <li key={hint}>{hint}</li>
              ))}
            </ul>
          </div>
        ) : null}
        <details className="score-help">
          <summary>
            <CircleHelp size={16} strokeWidth={2} aria-hidden="true" />
            What affects this score?
          </summary>
          <ul className="readiness-bars">
            {readiness.components.map((item) => (
              <li key={item.key}>
                <span>
                  {item.label}
                  {item.hint ? <small>{item.hint}</small> : null}
                </span>
                <b>
                  <i style={{ width: `${Math.round((item.score / item.max) * 100)}%` }} />
                </b>
              </li>
            ))}
          </ul>
        </details>
      </section>

      <section className="profile-panel">
        <div className="profile-section-head">
          <h3>
            <Sparkles size={18} strokeWidth={2} aria-hidden="true" />
            Your Strongest Signals
          </h3>
        </div>
        {signals.length ? (
          <ul className="signal-list">
            {signals.map((signal) => (
              <li key={signal}>{signal}</li>
            ))}
          </ul>
        ) : (
          <p>Add background details to highlight where you fit.</p>
        )}
      </section>

      <section className="profile-panel matches-panel">
        <div className="profile-section-head">
          <h3>
            <Target size={18} strokeWidth={2} aria-hidden="true" />
            Top Opportunity Matches
          </h3>
          <a href="/opportunities?sort=match">View All Matches →</a>
        </div>
        {!canScore ? (
          <div className="opportunity-empty">
            <p>Complete your profile to unlock personalized opportunity matches.</p>
            <a className="primary-button" href="/profile/edit">
              Complete Profile
            </a>
          </div>
        ) : matches.length ? (
          matches.map((item) => <OpportunityCard key={item.id} opportunity={item} compact />)
        ) : (
          <div className="opportunity-empty">
            <p>No matching opportunities yet. Browse the board while we continue adding listings.</p>
            <a className="primary-button" href="/opportunities">
              Browse Opportunities
            </a>
          </div>
        )}
      </section>

      <section className="profile-panel">
        <div className="profile-section-head">
          <h3>Your AI Training Journey</h3>
        </div>
        <ol className="journey-steps">
          {journey.map((step) => (
            <li key={step.label} className={step.done ? 'is-complete' : undefined}>
              {step.done ? (
                <CheckCircle2 size={18} strokeWidth={2} aria-hidden="true" />
              ) : (
                <Circle size={18} strokeWidth={2} aria-hidden="true" />
              )}
              <span>{step.label}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="profile-panel">
        <div className="profile-section-head">
          <h3>
            <Bookmark size={18} strokeWidth={2} aria-hidden="true" />
            Saved Opportunities
          </h3>
          <a href="/saved-opportunities">View Saved Opportunities</a>
        </div>
        {saved.length === 0 ? (
          <div className="opportunity-empty">
            <p>You haven&apos;t saved any opportunities yet.</p>
            <a className="primary-button" href="/opportunities">
              Browse Opportunities
            </a>
          </div>
        ) : (
          saved.map((item) => <OpportunityCard key={item.id} opportunity={item} compact />)
        )}
      </section>

      <div className="profile-detail-grid">
        <section className="profile-panel">
          <h3>Background</h3>
          <dl className="profile-facts">
            <div>
              <dt>Professional field</dt>
              <dd>{profile.profession || '—'}</dd>
            </div>
            <div>
              <dt>Industry</dt>
              <dd>{joinValues(profile.specialties) || '—'}</dd>
            </div>
            <div>
              <dt>Years of experience</dt>
              <dd>{profile.yearsDomainExperience ?? '—'}</dd>
            </div>
            <div>
              <dt>Education</dt>
              <dd>{profile.educationLevel || '—'}</dd>
            </div>
          </dl>
        </section>
        <section className="profile-panel">
          <h3>Skills & Expertise</h3>
          <dl className="profile-facts">
            <div>
              <dt>Skills</dt>
              <dd>{joinValues(profile.skills) || '—'}</dd>
            </div>
            <div>
              <dt>Domain expertise</dt>
              <dd>{joinValues(profile.specialties) || '—'}</dd>
            </div>
            <div>
              <dt>Languages</dt>
              <dd>{joinValues(profile.languages) || '—'}</dd>
            </div>
          </dl>
        </section>
        <section className="profile-panel">
          <h3>AI Training</h3>
          <dl className="profile-facts">
            <div>
              <dt>Platforms</dt>
              <dd>{joinValues(profile.platformsJoined) || '—'}</dd>
            </div>
            <div>
              <dt>AI-training experience</dt>
              <dd>{profile.yearsOfAiTraining ? `${profile.yearsOfAiTraining} years` : '—'}</dd>
            </div>
            <div>
              <dt>Current platform status</dt>
              <dd>{profile.platformStatus || '—'}</dd>
            </div>
          </dl>
        </section>
        <section className="profile-panel">
          <h3>Availability & Preferences</h3>
          <dl className="profile-facts">
            <div>
              <dt>Weekly availability</dt>
              <dd>{profile.weeklyAvailability || '—'}</dd>
            </div>
            <div>
              <dt>Remote preference</dt>
              <dd>{profile.remotePreference || '—'}</dd>
            </div>
            <div>
              <dt>Desired opportunity types</dt>
              <dd>{joinValues(profile.desiredCategories) || '—'}</dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="profile-panel coaching-panel">
        <p>Want help turning this profile into a focused AI-training plan?</p>
        <BookIntroCallButton className="secondary-button on-light" href="/#apply" />
      </section>

      {activity.length ? (
        <p className="profile-activity-note">
          Latest activity: {activity[0].message} · {new Date(activity[0].createdAt).toLocaleDateString()}
        </p>
      ) : null}
    </div>
  );
}
