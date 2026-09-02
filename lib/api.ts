import type { ApplicantStage } from './apply-fields';

function apiBaseUrl(): string {
  // Same origin as the site. Dev: Vite proxies /v1 to http://127.0.0.1:4000.
  // Production: Netlify proxies /v1 to https://api.aitrainers.coach.
  return '';
}

export type Application = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  timezone: string;
  status: string;
};

export type TimeSlot = {
  startsAt: string;
  endsAt: string;
  local: {
    timezone: string;
    startsAt: string | null;
    endsAt: string | null;
    label: string;
  };
};

export type Booking = {
  id: string;
  applicationId: string;
  startsAt: string;
  endsAt: string;
  status: string;
  meetingUrl: string | null;
  cancelToken?: string;
};

export type CreateApplicationInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  profession: string;
  yearsOfExperience: number;
  timezone: string;
  ipAddress?: string;
  ipLocation?: string;
  applicant_stage: ApplicantStage;
  referral_source?: string;
  us_eligibility_confirmed: boolean;
};

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: Array<{ path: string; message: string }>;

  constructor(
    status: number,
    code: string,
    message: string,
    details?: Array<{ path: string; message: string }>,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

type ErrorBody = {
  error?: {
    code?: string;
    message?: string;
    details?: Array<{ path: string; message: string }>;
  };
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl()}${path}`, {
      ...init,
      credentials: 'include',
      headers: {
        'content-type': 'application/json',
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new ApiError(
      0,
      'NETWORK_ERROR',
      'Could not reach the AI Trainers service. Make sure the API is running.',
    );
  }

  const data = (await response.json().catch(() => ({}))) as ErrorBody & T;
  if (!response.ok) {
    throw new ApiError(
      response.status,
      data.error?.code ?? 'REQUEST_ERROR',
      data.error?.message ?? 'Something went wrong. Please try again.',
      data.error?.details,
    );
  }
  return data as T;
}

export function createApplication(input: CreateApplicationInput) {
  return request<{ application: Application }>('/v1/applications', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function listSlots(timezone: string) {
  const params = new URLSearchParams({ timezone });
  return request<{ slots: TimeSlot[] }>(`/v1/slots?${params.toString()}`);
}

export function createBooking(input: { applicationId: string; startsAt: string }) {
  return request<{ booking: Booking }>('/v1/bookings', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function cancelBooking(id: string, token: string) {
  return request<{ booking: Booking }>(`/v1/bookings/${id}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

export type AuthUser = {
  id: string;
  email: string;
  emailVerified: boolean;
};

export type MatchReason = {
  kind: 'match' | 'gap' | 'hard';
  text: string;
};

export type OpportunityMatch = {
  score: number;
  label: string;
  reasons: MatchReason[];
  hardMismatches: string[];
};

export type Opportunity = {
  id: string;
  sourcePlatform: string;
  sourceUrl: string;
  title: string;
  summary: string;
  category: string;
  skills: string[];
  experienceRequirement: string | null;
  location: string | null;
  remoteStatus: string | null;
  compensationText: string | null;
  beginnerFriendly: boolean;
  eligibility: string | null;
  postedAt: string | null;
  firstSeenAt: string;
  lastVerifiedAt: string;
  status: string;
  saved: boolean;
  match: OpportunityMatch | null;
};

export type AccountProfile = {
  firstName: string;
  lastName: string;
  phone: string | null;
  city: string | null;
  state: string | null;
  profession: string | null;
  timezone: string | null;
  applicantStage: ApplicantStage | null;
  yearsOfAiTraining: number;
  usEligibilityConfirmed: boolean;
  yearsDomainExperience: number | null;
  specialties: string[];
  skills: string[];
  educationLevel: string | null;
  desiredCategories: string[];
  weeklyAvailability: string | null;
  platformsJoined: string[];
  platformStatus: string | null;
  remotePreference: string | null;
  languages: string[];
  updatedAt: string;
};

export type ReadinessScore = {
  score: number;
  completeEnough: boolean;
  components: Array<{ key: string; label: string; score: number; max: number; hint?: string }>;
};

export type AccountActivity = {
  id: string;
  type: string;
  message: string;
  createdAt: string;
};

export type OpportunityFilters = {
  q?: string;
  platform?: string;
  category?: string;
  beginnerFriendly?: boolean;
  remote?: boolean;
  sort?: 'newest' | 'match';
  limit?: number;
};

export function getCurrentUser() {
  return request<{ user: AuthUser | null }>('/v1/auth/me');
}

export function registerAccount(input: { email: string; password: string }) {
  return request<{ user: AuthUser }>('/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function loginAccount(input: { email: string; password: string; remember?: boolean }) {
  return request<{ user: AuthUser }>('/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function logoutAccount() {
  return request<{ ok: true }>('/v1/auth/logout', { method: 'POST' });
}

export function verifyAccountEmail(token: string) {
  return request<{ user: AuthUser }>('/v1/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

export function forgotPassword(email: string) {
  return request<{ ok: true }>('/v1/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export function resetPassword(input: { token: string; password: string }) {
  return request<{ ok: true }>('/v1/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function resendVerification() {
  return request<{ ok: true }>('/v1/auth/resend-verification', { method: 'POST' });
}

export function listOpportunities(filters: OpportunityFilters = {}) {
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  if (filters.platform) params.set('platform', filters.platform);
  if (filters.category) params.set('category', filters.category);
  if (filters.beginnerFriendly != null) params.set('beginnerFriendly', String(filters.beginnerFriendly));
  if (filters.remote) params.set('remote', 'true');
  if (filters.sort) params.set('sort', filters.sort);
  if (filters.limit) params.set('limit', String(filters.limit));
  const query = params.toString();
  return request<{
    opportunities: Opportunity[];
    filters: { platforms: string[]; categories: string[] };
    matchAvailable: boolean;
  }>(`/v1/opportunities${query ? `?${query}` : ''}`);
}

export function saveOpportunity(id: string) {
  return request<{ opportunity: Opportunity }>(`/v1/opportunities/${id}/save`, { method: 'POST' });
}

export function unsaveOpportunity(id: string) {
  return request<{ ok: true }>(`/v1/opportunities/${id}/save`, { method: 'DELETE' });
}

export function listSavedOpportunities() {
  return request<{ opportunities: Opportunity[] }>('/v1/opportunities/saved');
}

export function getAccountProfile() {
  return request<{
    user: AuthUser;
    profile: AccountProfile;
    readiness: ReadinessScore;
    canScoreMatch: boolean;
    applications: Array<{ id: string; status: string; createdAt: string; firstName: string; lastName: string }>;
  }>('/v1/account/profile');
}

export function updateAccountProfile(input: Partial<AccountProfile>) {
  return request<{
    user: AuthUser;
    profile: AccountProfile;
    readiness: ReadinessScore;
    canScoreMatch: boolean;
  }>('/v1/account/profile', {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function listAccountActivity() {
  return request<{ activity: AccountActivity[] }>('/v1/account/activity');
}
