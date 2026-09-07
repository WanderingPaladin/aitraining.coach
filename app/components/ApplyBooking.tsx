'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  ArrowRight,
  CalendarDays,
  Check,
  CircleCheckBig,
  ClipboardCheck,
  Clock,
  Gift,
  Globe2,
  Mail,
  MapPin,
  RotateCcw,
  Video,
} from 'lucide-react';
import {
  ApiError,
  cancelBooking,
  createApplication,
  createBooking,
  listSlots,
  type Application,
  type Booking,
  type TimeSlot,
} from '../../lib/api';
import { openAssistant } from '../../lib/assistant';
import {
  findPhoneCountry,
  findPhoneCountryByName,
  experienceYearOptions,
  isValidApplicantStage,
  isValidEmail,
  phoneCountries,
  professions,
  referralSources,
  resolveReferralSource,
  sanitizePhoneInput,
  toE164,
  usStates,
  validateApplyFields,
  type ApplicantStage,
  type ApplyFieldErrors,
} from '../../lib/apply-fields';
import { requestFeedbackPrompt } from '../../lib/feedback-storage';
import ApplicantStageSelector from './ApplicantStageSelector';
import BookingScheduler from './BookingScheduler';
import { trackEvent, trackingIds } from '../../lib/tracking';

type IpGeo = {
  ip: string;
  label: string;
};

function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

function packIpGeo(data: {
  ip?: string;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  countryCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}): IpGeo | null {
  if (!data.ip) {
    return null;
  }
  const place = [data.city, data.region, data.country].filter(Boolean).join(', ');
  return {
    ip: data.ip,
    label: JSON.stringify({
      ip: data.ip,
      city: data.city ?? null,
      region: data.region ?? null,
      country: data.country ?? null,
      countryCode: data.countryCode ?? null,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      label: place,
    }),
  };
}

async function lookupIpLocation(): Promise<IpGeo | null> {
  try {
    const response = await fetch('https://ipwho.is/', { signal: AbortSignal.timeout(5000) });
    const data = (await response.json()) as {
      success?: boolean;
      ip?: string;
      city?: string;
      region?: string;
      country?: string;
      country_code?: string;
      latitude?: number;
      longitude?: number;
    };
    if (data?.success) {
      const geo = packIpGeo({ ...data, countryCode: data.country_code });
      if (geo) {
        return geo;
      }
    }
  } catch {
    // try the fallback below
  }

  try {
    const response = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(5000) });
    const data = (await response.json()) as {
      error?: boolean;
      ip?: string;
      city?: string;
      region?: string;
      country_name?: string;
      country_code?: string;
      latitude?: number;
      longitude?: number;
    };
    if (!data?.error) {
      return packIpGeo({
        ip: data.ip,
        city: data.city,
        region: data.region,
        country: data.country_name,
        countryCode: data.country_code,
        latitude: data.latitude,
        longitude: data.longitude,
      });
    }
  } catch {
    return null;
  }

  return null;
}

function formatBookingWhen(startsAt: string, timezone: string): string {
  const date = new Date(startsAt);
  const day = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: timezone,
  }).format(date);
  const time = new Intl.DateTimeFormat('en-US', {
    timeStyle: 'short',
    timeZone: timezone,
  }).format(date);
  return `${day} at ${time}`;
}

function formatTimezoneLabel(timezone: string): string {
  try {
    const offset = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'shortOffset',
    })
      .formatToParts(new Date())
      .find((part) => part.type === 'timeZoneName')?.value;
    const name = timezone.replace(/_/g, ' ');
    return offset ? `${name} (${offset})` : name;
  } catch {
    return timezone.replace(/_/g, ' ');
  }
}

const flowSteps = [
  { id: 'apply', label: 'Apply' },
  { id: 'book', label: 'Book a Call' },
  { id: 'done', label: 'Confirmed' },
] as const;

function flowStepClass(step: 'apply' | 'book' | 'done', id: (typeof flowSteps)[number]['id']) {
  if (id === step) {
    return 'current';
  }
  if (id === 'apply' && step !== 'apply') {
    return 'complete';
  }
  if (id === 'book' && step === 'done') {
    return 'complete';
  }
  return 'upcoming';
}

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phoneCountry: string;
  phone: string;
  city: string;
  state: string;
  profession: string;
  yearsOfExperience: string;
  timezone: string;
  applicant_stage: ApplicantStage | '';
  referral_source: string;
  referral_source_detail: string;
  us_eligibility_confirmed: boolean;
};

const initialForm = (timezone: string): FormState => ({
  firstName: '',
  lastName: '',
  email: '',
  phoneCountry: 'US',
  phone: '',
  city: '',
  state: '',
  profession: '',
  yearsOfExperience: '',
  timezone,
  applicant_stage: '',
  referral_source: '',
  referral_source_detail: '',
  us_eligibility_confirmed: false,
});

export default function ApplyBooking() {
  const [step, setStep] = useState<'apply' | 'book' | 'done'>('apply');
  const [form, setForm] = useState<FormState>(() => initialForm('UTC'));
  const [ipGeo, setIpGeo] = useState<IpGeo | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ApplyFieldErrors>({});
  const skipStepScroll = useRef(true);
  const applicationStarted = useRef(false);
  const bookingStarted = useRef(false);

  useEffect(() => {
    setForm((current) => ({ ...current, timezone: detectTimezone() }));
    void lookupIpLocation().then((result) => {
      if (!result) {
        return;
      }
      setIpGeo(result);
      try {
        const parsed = JSON.parse(result.label) as { country?: string | null; countryCode?: string | null };
        const country =
          (parsed.countryCode ? findPhoneCountry(parsed.countryCode) : undefined) ??
          (parsed.country ? findPhoneCountryByName(parsed.country) : undefined);
        if (country) {
          setForm((current) =>
            current.phoneCountry === 'US' ? { ...current, phoneCountry: country.iso } : current,
          );
        }
      } catch {
        // keep the default country code
      }
    });
  }, []);

  useEffect(() => {
    if (skipStepScroll.current) {
      skipStepScroll.current = false;
      return;
    }
    document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [step]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    if (
      !applicationStarted.current &&
      (key === 'applicant_stage' ||
        key === 'firstName' ||
        key === 'lastName' ||
        key === 'email' ||
        key === 'phone' ||
        key === 'city' ||
        key === 'state' ||
        key === 'profession' ||
        key === 'yearsOfExperience' ||
        key === 'referral_source')
    ) {
      applicationStarted.current = true;
      trackEvent({ eventType: 'application_started' });
    }
    if (key === 'applicant_stage' && value) {
      trackEvent({
        eventType: 'application_stage_selected',
        metadata: { stage: String(value) },
      });
    }
    const field: keyof ApplyFieldErrors | undefined =
      key === 'phoneCountry'
        ? 'phone'
        : key === 'referral_source_detail'
          ? 'referral_source'
          : key === 'firstName' ||
              key === 'lastName' ||
              key === 'email' ||
              key === 'phone' ||
              key === 'city' ||
              key === 'state' ||
              key === 'profession' ||
              key === 'yearsOfExperience' ||
              key === 'applicant_stage' ||
              key === 'referral_source' ||
              key === 'us_eligibility_confirmed'
            ? key
            : undefined;
    if (!field) {
      return;
    }
    setFieldErrors((current) => {
      if (!current[field]) {
        return current;
      }
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function validateContactField(field: 'email' | 'phone', current = form) {
    if (field === 'email') {
      const email = current.email.trim();
      if (!email) {
        return;
      }
      setFieldErrors((errors) => {
        if (isValidEmail(email)) {
          if (!errors.email) {
            return errors;
          }
          const next = { ...errors };
          delete next.email;
          return next;
        }
        return { ...errors, email: 'Enter a valid email address, like you@company.com.' };
      });
      return;
    }

    if (!current.phone.trim()) {
      return;
    }
    setFieldErrors((errors) => {
      if (toE164(current.phoneCountry, current.phone)) {
        if (!errors.phone) {
          return errors;
        }
        const next = { ...errors };
        delete next.phone;
        return next;
      }
      const country = findPhoneCountry(current.phoneCountry);
      const expected = country?.lengths.join(' or ');
      return {
        ...errors,
        phone: expected
          ? `Enter a real ${expected}-digit phone number for the selected country.`
          : 'Enter a valid phone number.',
      };
    });
  }

  async function loadSlots(timezone: string) {
    setLoadingSlots(true);
    setError(null);
    try {
      const result = await listSlots(timezone);
      setSlots(result.slots);
      setSelectedSlot((current) =>
        result.slots.some((slot) => slot.startsAt === current) ? current : '',
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load available times.');
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }

  async function handleApply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextFieldErrors = validateApplyFields({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phoneCountry: form.phoneCountry,
      phone: form.phone,
      city: form.city,
      state: form.state,
      profession: form.profession,
      yearsOfExperience: form.yearsOfExperience,
      applicant_stage: form.applicant_stage,
      referral_source: form.referral_source,
      referral_source_detail: form.referral_source_detail,
      us_eligibility_confirmed: form.us_eligibility_confirmed,
    });
    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      if (!nextFieldErrors.applicant_stage || Object.keys(nextFieldErrors).length > 1) {
        setError('Please fix the highlighted fields.');
      } else {
        setError(null);
      }
      return;
    }

    const phone = toE164(form.phoneCountry, form.phone);
    if (!phone) {
      setFieldErrors({ phone: 'Enter a valid phone number.' });
      return;
    }
    if (!isValidApplicantStage(form.applicant_stage)) {
      setFieldErrors({
        applicant_stage: 'Please select the option that best describes your current situation.',
      });
      return;
    }

    setSubmitting(true);
    setError(null);
    setFieldErrors({});
    try {
      const geo = ipGeo ?? (await lookupIpLocation());
      if (geo && !ipGeo) {
        setIpGeo(geo);
      }
      const ids = trackingIds();
      const result = await createApplication({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone,
        city: form.city.trim().replace(/\s+/g, ' '),
        state: form.state,
        profession: form.profession,
        yearsOfExperience: Number(form.yearsOfExperience),
        timezone: form.timezone,
        applicant_stage: form.applicant_stage,
        referral_source: resolveReferralSource(form.referral_source, form.referral_source_detail),
        us_eligibility_confirmed: form.us_eligibility_confirmed,
        ipAddress: geo?.ip,
        ipLocation: geo?.label,
        visitorId: ids.visitorId || undefined,
        sessionId: ids.sessionId || undefined,
      });
      setApplication(result.application);
      setStep('book');
      if (!bookingStarted.current) {
        bookingStarted.current = true;
        trackEvent({
          eventType: 'booking_started',
          applicationId: result.application.id,
        });
      }
      requestFeedbackPrompt('application');
      await loadSlots(form.timezone);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not submit your application.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleBook(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!application || !selectedSlot) {
      setError('Choose a time for your intro call.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const ids = trackingIds();
      const result = await createBooking({
        applicationId: application.id,
        startsAt: selectedSlot,
        visitorId: ids.visitorId || undefined,
        sessionId: ids.sessionId || undefined,
      });
      setBooking(result.booking);
      setStep('done');
      requestFeedbackPrompt('booking');
    } catch (err) {
      if (err instanceof ApiError && err.code === 'SLOT_UNAVAILABLE') {
        setError('That time was just booked by someone else. Please choose another available time.');
        await loadSlots(form.timezone);
        setSelectedSlot('');
      } else {
        setError(err instanceof ApiError ? err.message : 'Could not book that time.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReschedule() {
    if (!booking) {
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      if (booking.cancelToken) {
        await cancelBooking(booking.id, booking.cancelToken);
      }
      setBooking(null);
      setSelectedSlot('');
      setStep('book');
      if (application && !bookingStarted.current) {
        bookingStarted.current = true;
        trackEvent({ eventType: 'booking_started', applicationId: application.id });
      }
      await loadSlots(form.timezone);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not open rescheduling. Try again, or use the link in your email.');
    } finally {
      setSubmitting(false);
    }
  }

  const selectedPhoneCountry = findPhoneCountry(form.phoneCountry) ?? phoneCountries[0];

  return (
    <div className="apply-panel">
      <ol className="apply-steps" aria-label="Application steps">
        {flowSteps.map((item, index) => {
          const status = flowStepClass(step, item.id);
          return (
            <li key={item.id} className={status} aria-current={status === 'current' ? 'step' : undefined}>
              <span className="apply-step-index" aria-hidden="true">
                {status === 'complete' ? <Check size={12} strokeWidth={3} /> : index + 1}
              </span>
              <span className="apply-step-label">{item.label}</span>
            </li>
          );
        })}
      </ol>

      {error && (
        <p className="apply-error" role="alert">
          {error}
        </p>
      )}

      {step === 'apply' && (
        <form className="apply-form" onSubmit={handleApply} noValidate>
          <input type="hidden" name="timezone" value={form.timezone} />
          <input type="hidden" name="ipAddress" value={ipGeo?.ip ?? ''} />
          <input type="hidden" name="ipLocation" value={ipGeo?.label ?? ''} />

          <div className="apply-eligibility-notice">
            <MapPin size={16} strokeWidth={2} aria-hidden="true" />
            <div>
              <strong>Currently available to U.S.-based participants</strong>
              <p>
                You must currently reside in the United States and be eligible to create accounts on
                supported AI-training platforms.
              </p>
            </div>
          </div>

          <ApplicantStageSelector
            value={form.applicant_stage}
            error={fieldErrors.applicant_stage}
            onChange={(stage) => update('applicant_stage', stage)}
          />

          <div className="apply-grid">
            <label>
              First name
              <input
                name="firstName"
                autoComplete="given-name"
                required
                maxLength={80}
                className={fieldErrors.firstName ? 'apply-invalid' : undefined}
                aria-invalid={Boolean(fieldErrors.firstName)}
                value={form.firstName}
                onChange={(event) => update('firstName', event.target.value)}
              />
              {fieldErrors.firstName && <span className="apply-field-error">{fieldErrors.firstName}</span>}
            </label>
            <label>
              Last name
              <input
                name="lastName"
                autoComplete="family-name"
                required
                maxLength={80}
                className={fieldErrors.lastName ? 'apply-invalid' : undefined}
                aria-invalid={Boolean(fieldErrors.lastName)}
                value={form.lastName}
                onChange={(event) => update('lastName', event.target.value)}
              />
              {fieldErrors.lastName && <span className="apply-field-error">{fieldErrors.lastName}</span>}
            </label>
            <label>
              Email
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                inputMode="email"
                spellCheck={false}
                maxLength={254}
                className={fieldErrors.email ? 'apply-invalid' : undefined}
                aria-invalid={Boolean(fieldErrors.email)}
                value={form.email}
                onChange={(event) => update('email', event.target.value)}
                onBlur={() => validateContactField('email')}
              />
              {fieldErrors.email && <span className="apply-field-error">{fieldErrors.email}</span>}
            </label>
            <label>
              Phone number
              <div className="apply-phone-row">
                <select
                  name="phoneCountry"
                  aria-label="Country code"
                  className={fieldErrors.phone ? 'apply-invalid' : undefined}
                  value={form.phoneCountry}
                  onChange={(event) => {
                    const phoneCountry = event.target.value;
                    update('phoneCountry', phoneCountry);
                    validateContactField('phone', { ...form, phoneCountry });
                  }}
                >
                  {phoneCountries.map((country) => (
                    <option key={country.iso} value={country.iso}>
                      {country.iso} +{country.dial}
                    </option>
                  ))}
                </select>
                <input
                  name="phone"
                  type="tel"
                  autoComplete="tel-national"
                  inputMode="tel"
                  required
                  maxLength={22}
                  className={fieldErrors.phone ? 'apply-invalid' : undefined}
                  aria-invalid={Boolean(fieldErrors.phone)}
                  placeholder={selectedPhoneCountry.lengths[0] === 10 ? '202 555 1234' : 'Phone number'}
                  value={form.phone}
                  onChange={(event) => update('phone', sanitizePhoneInput(event.target.value))}
                  onBlur={() => validateContactField('phone')}
                />
              </div>
              {fieldErrors.phone && <span className="apply-field-error">{fieldErrors.phone}</span>}
            </label>
            <label>
              City
              <input
                name="city"
                autoComplete="address-level2"
                required
                maxLength={80}
                className={fieldErrors.city ? 'apply-invalid' : undefined}
                aria-invalid={Boolean(fieldErrors.city)}
                value={form.city}
                onChange={(event) => update('city', event.target.value)}
              />
              {fieldErrors.city && <span className="apply-field-error">{fieldErrors.city}</span>}
            </label>
            <label>
              State
              <select
                name="state"
                required
                autoComplete="address-level1"
                className={fieldErrors.state ? 'apply-invalid' : undefined}
                aria-invalid={Boolean(fieldErrors.state)}
                value={form.state}
                onChange={(event) => update('state', event.target.value)}
              >
                <option value="" disabled>
                  Select state
                </option>
                {usStates.map((state) => (
                  <option key={state.code} value={state.code}>
                    {state.name}
                  </option>
                ))}
              </select>
              {fieldErrors.state && <span className="apply-field-error">{fieldErrors.state}</span>}
            </label>
            <label>
              Profession
              <select
                name="profession"
                required
                className={fieldErrors.profession ? 'apply-invalid' : undefined}
                aria-invalid={Boolean(fieldErrors.profession)}
                value={form.profession}
                onChange={(event) => update('profession', event.target.value)}
              >
                <option value="" disabled>
                  Select profession
                </option>
                {professions.map((label) => (
                  <option key={label} value={label}>
                    {label}
                  </option>
                ))}
              </select>
              {fieldErrors.profession && <span className="apply-field-error">{fieldErrors.profession}</span>}
            </label>
            <label>
              Years of AI training
              <select
                name="yearsOfExperience"
                required
                className={fieldErrors.yearsOfExperience ? 'apply-invalid' : undefined}
                aria-invalid={Boolean(fieldErrors.yearsOfExperience)}
                value={form.yearsOfExperience}
                onChange={(event) => update('yearsOfExperience', event.target.value)}
              >
                <option value="" disabled>
                  Select years
                </option>
                {experienceYearOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {fieldErrors.yearsOfExperience && (
                <span className="apply-field-error">{fieldErrors.yearsOfExperience}</span>
              )}
            </label>
            <label className="apply-span-2">
              Where did you find us? <span>(optional)</span>
              <select
                name="referral_source"
                className={fieldErrors.referral_source ? 'apply-invalid' : undefined}
                aria-invalid={Boolean(fieldErrors.referral_source)}
                value={form.referral_source}
                onChange={(event) => {
                  update('referral_source', event.target.value);
                  if (event.target.value !== 'other') {
                    update('referral_source_detail', '');
                  }
                }}
              >
                <option value="">Select one</option>
                {referralSources.map((source) => (
                  <option key={source.value} value={source.value}>
                    {source.label}
                  </option>
                ))}
              </select>
              {form.referral_source === 'other' ? (
                <input
                  name="referral_source_detail"
                  maxLength={120}
                  placeholder="Tell us a bit more"
                  className={fieldErrors.referral_source ? 'apply-invalid' : undefined}
                  value={form.referral_source_detail}
                  onChange={(event) => update('referral_source_detail', event.target.value)}
                />
              ) : null}
              {fieldErrors.referral_source && (
                <span className="apply-field-error">{fieldErrors.referral_source}</span>
              )}
            </label>
          </div>

          <div className="apply-eligibility-confirm">
            <label
              className={[
                'apply-eligibility-label',
                form.us_eligibility_confirmed ? 'is-checked' : '',
                fieldErrors.us_eligibility_confirmed ? 'has-error' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <input
                type="checkbox"
                name="us_eligibility_confirmed"
                required
                checked={form.us_eligibility_confirmed}
                aria-invalid={Boolean(fieldErrors.us_eligibility_confirmed)}
                onChange={(event) => update('us_eligibility_confirmed', event.target.checked)}
              />
              <span className="apply-eligibility-copy">
                I currently reside in the United States and am eligible to create accounts on supported
                AI-training platforms.
              </span>
            </label>
            <p className="apply-eligibility-note">
              This requirement helps ensure applicants can access the platforms and opportunities
              discussed during coaching.
            </p>
            {fieldErrors.us_eligibility_confirmed && (
              <span className="apply-field-error">{fieldErrors.us_eligibility_confirmed}</span>
            )}
          </div>

          <button className="apply-submit" type="submit" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Continue to book a call'}
            <ArrowRight className="btn-icon" size={16} strokeWidth={2} />
          </button>
        </form>
      )}

      {step === 'book' && (
        <form className="apply-form apply-book" onSubmit={handleBook}>
          <div className="apply-book-head">
            <h3>Book Your Free Intro Call</h3>
            <p>
              We already have your application details.
              <br />
              Just choose a time that works best for you.
            </p>
          </div>

          <ul className="apply-book-meta">
            <li>
              <Clock size={14} strokeWidth={2} aria-hidden="true" />
              30 minutes
            </li>
            <li>
              <Video size={14} strokeWidth={2} aria-hidden="true" />
              Microsoft Teams
            </li>
            <li>
              <Gift size={14} strokeWidth={2} aria-hidden="true" />
              Free
            </li>
            <li>
              <ClipboardCheck size={14} strokeWidth={2} aria-hidden="true" />
              No extra form needed
            </li>
          </ul>

          <p className="apply-book-timezone">
            <Globe2 size={14} strokeWidth={2} aria-hidden="true" />
            Times shown in: <strong>{formatTimezoneLabel(form.timezone)}</strong>
          </p>

          <div className="apply-book-layout">
            <aside className="apply-book-sidebar">
              <div className="apply-book-expect">
                <h4>What to expect in this call</h4>
                <ul>
                  <li>
                    <Check size={14} strokeWidth={2.5} aria-hidden="true" />
                    A focused 30-minute conversation
                  </li>
                  <li>
                    <Check size={14} strokeWidth={2.5} aria-hidden="true" />
                    Understand your background and goals
                  </li>
                  <li>
                    <Check size={14} strokeWidth={2.5} aria-hidden="true" />
                    Discuss where AI training could fit
                  </li>
                  <li>
                    <Check size={14} strokeWidth={2.5} aria-hidden="true" />
                    Clarify your next steps
                  </li>
                  <li>
                    <Check size={14} strokeWidth={2.5} aria-hidden="true" />
                    Answer your questions
                  </li>
                </ul>
              </div>
              <div className="apply-book-received">
                <h4>Application received</h4>
                <p>
                  <Check size={14} strokeWidth={2.5} aria-hidden="true" />
                  We already have your information. No extra form needed.
                </p>
              </div>
            </aside>

            <div className="apply-book-scheduler">
              {loadingSlots && <p className="apply-muted">Loading open times…</p>}

              {!loadingSlots && slots.length === 0 && (
                <p className="apply-muted">
                  No intro-call times are open right now. Check back soon, or email us and we’ll find a
                  slot.
                </p>
              )}

              {!loadingSlots && slots.length > 0 && (
                <BookingScheduler
                  slots={slots}
                  timezone={form.timezone}
                  selectedSlot={selectedSlot}
                  onSelectDate={(date) =>
                    trackEvent({
                      eventType: 'booking_date_selected',
                      applicationId: application?.id,
                      metadata: { date },
                    })
                  }
                  onSelectSlot={(startsAt) => {
                    setSelectedSlot(startsAt);
                    if (startsAt) {
                      trackEvent({
                        eventType: 'booking_time_selected',
                        applicationId: application?.id,
                        metadata: { startsAt },
                      });
                    }
                  }}
                />
              )}

              <button className="apply-book-confirm" type="submit" disabled={submitting || !selectedSlot}>
                {submitting ? 'Booking…' : 'Confirm Booking'}
                <ArrowRight className="btn-icon" size={16} strokeWidth={2} />
              </button>
              <button
                className="apply-secondary"
                type="button"
                onClick={() => {
                  setStep('apply');
                  setError(null);
                }}
              >
                Back to application
              </button>
            </div>
          </div>
        </form>
      )}

      {step === 'done' && booking && (
        <div className="apply-success">
          <span className="apply-success-icon" aria-hidden="true">
            <CircleCheckBig size={32} strokeWidth={2} />
          </span>
          <h3>You’re booked</h3>
          <p>
            Thanks{application?.firstName ? `, ${application.firstName}` : ''}. Your free intro call is
            confirmed.
          </p>
          <ul className="apply-success-details">
            <li>
              <CalendarDays size={16} strokeWidth={2} aria-hidden="true" />
              <span>
                <strong>{formatBookingWhen(booking.startsAt, form.timezone)}</strong>
                <small>{formatTimezoneLabel(form.timezone)}</small>
              </span>
            </li>
            <li>
              <Video size={16} strokeWidth={2} aria-hidden="true" />
              <span>We’ll meet on Microsoft Teams. The join link is in your invite.</span>
            </li>
            <li>
              <Mail size={16} strokeWidth={2} aria-hidden="true" />
              <span>Check your email for the confirmation and calendar invite.</span>
            </li>
          </ul>
          {booking.meetingUrl && (
            <a className="apply-submit" href={booking.meetingUrl} target="_blank" rel="noopener noreferrer">
              Open Microsoft Teams
              <Video className="btn-icon" size={16} strokeWidth={2} />
            </a>
          )}
          <button className="apply-secondary" type="button" onClick={() => openAssistant({ view: 'chat', topic: 'booking', contextType: 'booking' })}>
            Need help booking? Chat with Team
          </button>
          <button className="apply-secondary" type="button" disabled={submitting} onClick={() => void handleReschedule()}>
            {submitting ? 'Opening times…' : 'Reschedule'}
            <RotateCcw className="btn-icon" size={16} strokeWidth={2} />
          </button>
        </div>
      )}
    </div>
  );
}
