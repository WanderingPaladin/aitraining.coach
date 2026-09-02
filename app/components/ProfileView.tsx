'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
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
  new_no_account: 'New to AI training',
  has_accounts_no_time: 'Has accounts, limited time',
  working_no_progress: 'Already working, wants more progress',
};

function initials(profile: AccountProfile, email: string): string {
  const first = profile.firstName.trim();
  const last = profile.lastName.trim();
  if (first || last) {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || first.slice(0, 2).toUpperCase();
  }
  return (email.split('@')[0] ?? 'U').slice(0, 2).toUpperCase();
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
  const [error, setError] = useState('');
  const [verifyNotice, setVerifyNotice] = useState('');
  const [scoreOpen, setScoreOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login?next=/profile');
      return;
    }
    let cancelled = false;
    void Promise.all([
      getAccountProfile(),
      listOpportunities({ sort: 'match', limit: 5 }),
      listSavedOpportunities(),
      listAccountActivity(),
    ])
      .then(([account, opportunityResult, savedResult, activityResult]) => {
        if (cancelled) return;
        setProfile(account.profile);
        setReadiness(account.readiness);
        setCanScore(account.canScoreMatch);
        setMatches(opportunityResult.opportunities.slice(0, 5));
        setSaved(savedResult.opportunities.slice(0, 3));
        setActivity(activityResult.activity);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          router.replace('/login?next=/profile');
          return;
        }
        setError(err instanceof Error ? err.message : 'Could not load your profile.');
      });
    return () => {
      cancelled = true;
    };
  }, [loading, user, router]);

  if (loading || !user || !profile || !readiness) {
    return <p className="opportunity-empty">{error || 'Loading your profile…'}</p>;
  }

  const name = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || user.email;
  const location = [profile.city, profile.state].filter(Boolean).join(', ');
  const hints = readiness.components.filter((item) => item.hint).map((item) => item.hint!);

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
            <p>{[location, profile.profession].filter(Boolean).join(' · ') || 'Add your background to personalize matches.'}</p>
            {profile.applicantStage ? <p className="profile-stage">{STAGE_LABELS[profile.applicantStage]}</p> : null}
            <p className="profile-complete">Profile completeness {Math.min(100, readiness.score)}%</p>
            <div className="profile-identity-actions">
              <a className="primary-button" href="/profile/edit">
                Edit Profile
              </a>
              <BookIntroCallButton className="secondary-button on-light" href="/#apply" />
            </div>
          </div>
        </div>
        <div className="readiness-panel">
          <div
            className="readiness-ring"
            style={{ '--readiness': `${Math.min(100, readiness.score)}` } as CSSProperties}
          >
            <strong>{Math.min(100, readiness.score)}%</strong>
            <span>Readiness</span>
          </div>
          <p className="match-disclaimer">Profile readiness is a completeness indicator, not a hiring probability.</p>
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
          <button type="button" className="header-login" onClick={() => setScoreOpen(true)}>
            View how scoring works
          </button>
        </div>
      </section>

      <div className="profile-columns">
        <div>
          <div className="profile-section-head">
            <h3>Best Opportunity Matches</h3>
            <a href="/opportunities?sort=match">View all opportunities</a>
          </div>
          {!canScore ? (
            <div className="opportunity-empty">
              <p>Complete your profile to unlock personalized opportunity matches.</p>
              <a className="primary-button" href="/profile/edit">
                Complete Profile
              </a>
            </div>
          ) : (
            matches.map((item) => <OpportunityCard key={item.id} opportunity={item} compact />)
          )}
        </div>
        <aside className="profile-side">
          <section>
            <h3>Improve Your Readiness</h3>
            <ul className="improve-list">
              {(hints.length ? hints : ['Your profile already has the core matching fields.']).map((hint) => (
                <li key={hint}>{hint}</li>
              ))}
            </ul>
            <BookIntroCallButton className="secondary-button on-light" href="/#apply" />
          </section>
          <section>
            <div className="profile-section-head">
              <h3>Saved Opportunities</h3>
              <a href="/saved-opportunities">View all</a>
            </div>
            {saved.length === 0 ? (
              <p>No saved listings yet.</p>
            ) : (
              saved.map((item) => (
                <a key={item.id} className="saved-row" href={item.sourceUrl} target="_blank" rel="noopener noreferrer">
                  <strong>{item.title}</strong>
                  <span>{item.sourcePlatform}</span>
                </a>
              ))
            )}
          </section>
          <section>
            <h3>Recent Activity</h3>
            {activity.length === 0 ? (
              <p>No account activity yet.</p>
            ) : (
              <ul className="activity-list">
                {activity.map((item) => (
                  <li key={item.id}>
                    <strong>{item.message}</strong>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>

      {scoreOpen ? (
        <div className="filter-drawer" role="dialog" aria-label="How scoring works">
          <button type="button" className="filter-drawer-backdrop" onClick={() => setScoreOpen(false)} aria-label="Close" />
          <div className="filter-drawer-panel">
            <h2>How scoring works</h2>
            <p>
              Profile Match compares fields that exist on both your profile and a listing: domain, skills, experience, eligibility, availability, and platform status. Missing listing fields are skipped and the remaining weights are renormalized.
            </p>
            <p>
              Readiness is a separate completeness score for your profile. Neither score is a chance of being hired, accepted, or earning.
            </p>
            <button type="button" className="primary-button" onClick={() => setScoreOpen(false)}>
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
