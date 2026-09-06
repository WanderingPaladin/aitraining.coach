'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  ApiError,
  getAccountProfile,
  updateAccountProfile,
  type AccountProfile,
} from '../../lib/api';
import {
  experienceYearOptions,
  professions,
  usStates,
  type ApplicantStage,
} from '../../lib/apply-fields';
import { trainingPlatforms } from '../../lib/platforms';
import { setPendingFeedbackPrompt } from '../../lib/feedback-storage';
import { trackEvent } from '../../lib/tracking';
import ApplicantStageSelector from './ApplicantStageSelector';
import { useAuth } from './AuthProvider';

function joinList(values: string[]): string {
  return values.join(', ');
}

function splitList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function ProfileEditForm() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [specialties, setSpecialties] = useState('');
  const [skills, setSkills] = useState('');
  const [desired, setDesired] = useState('');
  const [languages, setLanguages] = useState('');

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login?returnTo=/profile/edit');
      return;
    }
    void getAccountProfile()
      .then((result) => {
        setProfile(result.profile);
        setSpecialties(joinList(result.profile.specialties));
        setSkills(joinList(result.profile.skills));
        setDesired(joinList(result.profile.desiredCategories));
        setLanguages(joinList(result.profile.languages));
      })
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 401) {
          router.replace('/login?returnTo=/profile/edit');
          return;
        }
        setError(err instanceof Error ? err.message : 'Could not load your profile.');
      });
  }, [loading, user, router]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!profile) return;
    setBusy(true);
    setError('');
    try {
      await updateAccountProfile({
        ...profile,
        applicantStage: profile.applicantStage || null,
        specialties: splitList(specialties),
        skills: splitList(skills),
        desiredCategories: splitList(desired),
        languages: splitList(languages),
      });
      trackEvent({
        eventType: profile.firstName && profile.profession ? 'profile_completed' : 'profile_created',
      });
      setPendingFeedbackPrompt('profile');
      router.push('/profile');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save your profile.');
    } finally {
      setBusy(false);
    }
  }

  if (!profile || !user) {
    return <p className="opportunity-empty">{error || 'Loading…'}</p>;
  }

  function update<K extends keyof AccountProfile>(key: K, value: AccountProfile[K]) {
    setProfile((current) => (current ? { ...current, [key]: value } : current));
  }

  return (
    <form className="apply-form profile-edit-form" onSubmit={(event) => void onSubmit(event)}>
      {error ? <p className="apply-field-error">{error}</p> : null}
      <div className="apply-grid">
        <label>
          First name
          <input value={profile.firstName} onChange={(event) => update('firstName', event.target.value)} />
        </label>
        <label>
          Last name
          <input value={profile.lastName} onChange={(event) => update('lastName', event.target.value)} />
        </label>
      </div>
      <label>
        Email
        <span>Account email cannot be changed here</span>
        <input value={user.email} readOnly />
      </label>
      <div className="apply-grid">
        <label>
          Phone
          <input value={profile.phone ?? ''} onChange={(event) => update('phone', event.target.value || null)} />
        </label>
        <label>
          City
          <input value={profile.city ?? ''} onChange={(event) => update('city', event.target.value || null)} />
        </label>
      </div>
      <div className="apply-grid">
        <label>
          State
          <select value={profile.state ?? ''} onChange={(event) => update('state', event.target.value || null)}>
            <option value="">Select</option>
            {usStates.map((state) => (
              <option key={state.code} value={state.code}>
                {state.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Profession
          <select
            value={profile.profession ?? ''}
            onChange={(event) => update('profession', event.target.value || null)}
          >
            <option value="">Select</option>
            {professions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>
      <ApplicantStageSelector
        value={(profile.applicantStage as ApplicantStage | '') ?? ''}
        onChange={(stage) => update('applicantStage', stage)}
      />
      <div className="apply-grid">
        <label>
          Years of AI training
          <select
            value={String(profile.yearsOfAiTraining)}
            onChange={(event) => update('yearsOfAiTraining', Number(event.target.value))}
          >
            {experienceYearOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Years of domain experience
          <input
            type="number"
            min={0}
            max={50}
            value={profile.yearsDomainExperience ?? ''}
            onChange={(event) =>
              update('yearsDomainExperience', event.target.value === '' ? null : Number(event.target.value))
            }
          />
        </label>
      </div>
      <label className="apply-eligibility-label">
        <input
          type="checkbox"
          checked={profile.usEligibilityConfirmed}
          onChange={(event) => update('usEligibilityConfirmed', event.target.checked)}
        />
        <span className="apply-eligibility-copy">I confirm I am eligible to create accounts on U.S. AI-training platforms.</span>
      </label>
      <label>
        Professional specialties
        <span>Comma-separated</span>
        <input value={specialties} onChange={(event) => setSpecialties(event.target.value)} />
      </label>
      <label>
        Skills
        <span>Comma-separated</span>
        <input value={skills} onChange={(event) => setSkills(event.target.value)} />
      </label>
      <label>
        Education or credential
        <input
          value={profile.educationLevel ?? ''}
          onChange={(event) => update('educationLevel', event.target.value || null)}
        />
      </label>
      <label>
        Desired opportunity categories
        <span>Comma-separated, e.g. Finance, Writing, Evaluation</span>
        <input value={desired} onChange={(event) => setDesired(event.target.value)} />
      </label>
      <div className="apply-grid">
        <label>
          Weekly availability
          <select
            value={profile.weeklyAvailability ?? ''}
            onChange={(event) => update('weeklyAvailability', event.target.value || null)}
          >
            <option value="">Select</option>
            <option value="5-10 hours">5–10 hours</option>
            <option value="10-15 hours">10–15 hours</option>
            <option value="15-20 hours">15–20 hours</option>
            <option value="20+ hours">20+ hours</option>
            <option value="flexible">Flexible</option>
          </select>
        </label>
        <label>
          Remote preference
          <select
            value={profile.remotePreference ?? ''}
            onChange={(event) => update('remotePreference', event.target.value || null)}
          >
            <option value="">Select</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="any">Any</option>
          </select>
        </label>
      </div>
      <fieldset className="platform-fieldset">
        <legend>Platforms joined</legend>
        {trainingPlatforms.map((platform) => {
          const checked = profile.platformsJoined.includes(platform.name);
          return (
            <label key={platform.name} className="apply-eligibility-label">
              <input
                type="checkbox"
                checked={checked}
                onChange={(event) => {
                  const next = event.target.checked
                    ? [...profile.platformsJoined, platform.name]
                    : profile.platformsJoined.filter((item) => item !== platform.name);
                  update('platformsJoined', next);
                }}
              />
              <span className="apply-eligibility-copy">{platform.name}</span>
            </label>
          );
        })}
      </fieldset>
      <label>
        Platform status
        <select
          value={profile.platformStatus ?? ''}
          onChange={(event) => update('platformStatus', event.target.value || null)}
        >
          <option value="">Select</option>
          <option value="none">No accounts yet</option>
          <option value="applied">Applied / waiting</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </label>
      <label>
        Languages
        <span>Comma-separated</span>
        <input value={languages} onChange={(event) => setLanguages(event.target.value)} />
      </label>
      <div className="profile-identity-actions">
        <button className="primary-button apply-submit" type="submit" disabled={busy}>
          Save profile
        </button>
        <a className="secondary-button on-light" href="/profile">
          Cancel
        </a>
      </div>
    </form>
  );
}
