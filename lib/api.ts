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
  listingKind?: 'curated' | 'job';
  slug?: string | null;
  companyLogoUrl?: string | null;
  applyUrl?: string | null;
  employmentType?: string | null;
  relevanceScore?: number | null;
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

export type PublicJob = {
  id: string;
  slug: string;
  title: string;
  companyName: string;
  companyLogoUrl: string | null;
  location: string | null;
  remoteType: string | null;
  employmentType: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  category: string | null;
  relevanceScore: number;
  postedAt: string | null;
  applyUrl: string;
  sourceUrl: string;
  descriptionHtml?: string;
  descriptionText?: string;
  experienceLevel?: string | null;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type JobListResponse = {
  jobs: PublicJob[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  filters: {
    categories: string[];
    companies: string[];
    employmentTypes: string[];
  };
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

export type OpportunityListResponse = {
  opportunities: Opportunity[];
  filters: { platforms: string[]; categories: string[] };
  matchAvailable: boolean;
};

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
  return request<OpportunityListResponse>(`/v1/opportunities${query ? `?${query}` : ''}`);
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

export type JobListFilters = {
  q?: string;
  remote?: boolean;
  location?: string;
  category?: string;
  employmentType?: string;
  company?: string;
  sort?: 'newest' | 'relevant';
  page?: number;
  pageSize?: number;
};

export function formatJobSalary(job: Pick<PublicJob, 'salaryMin' | 'salaryMax' | 'salaryCurrency'>): string | null {
  if (job.salaryMin == null && job.salaryMax == null) {
    return null;
  }
  const currency = job.salaryCurrency || 'USD';
  const format = (amount: number) =>
    amount >= 1000 && amount % 1000 === 0 ? `${Math.round(amount / 1000)}k` : new Intl.NumberFormat('en-US').format(amount);
  if (job.salaryMin != null && job.salaryMax != null) {
    return `${currency} ${format(job.salaryMin)}–${format(job.salaryMax)}`;
  }
  const amount = job.salaryMin ?? job.salaryMax;
  return amount == null ? null : `${currency} ${format(amount)}`;
}

export function jobToOpportunity(job: PublicJob): Opportunity {
  const summary = (job.descriptionText || '').replace(/\s+/g, ' ').trim().slice(0, 220);
  return {
    id: job.id,
    listingKind: 'job',
    slug: job.slug,
    companyLogoUrl: job.companyLogoUrl,
    applyUrl: job.applyUrl,
    employmentType: job.employmentType,
    relevanceScore: job.relevanceScore,
    sourcePlatform: job.companyName,
    sourceUrl: job.applyUrl,
    title: job.title,
    summary: summary || 'Open the listing to read the full employer description.',
    category: job.category || 'General AI Training',
    skills: [],
    experienceRequirement: job.experienceLevel ?? null,
    location: job.location,
    remoteStatus: job.remoteType,
    compensationText: formatJobSalary(job),
    beginnerFriendly: false,
    eligibility: null,
    postedAt: job.postedAt,
    firstSeenAt: job.createdAt,
    lastVerifiedAt: job.updatedAt,
    status: 'open',
    saved: false,
    match: null,
  };
}

export function listPublicJobs(filters: JobListFilters = {}) {
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  if (filters.remote) params.set('remote', 'true');
  if (filters.location) params.set('location', filters.location);
  if (filters.category) params.set('category', filters.category);
  if (filters.employmentType) params.set('employmentType', filters.employmentType);
  if (filters.company) params.set('company', filters.company);
  if (filters.sort) params.set('sort', filters.sort);
  params.set('page', String(filters.page ?? 1));
  params.set('pageSize', String(filters.pageSize ?? 20));
  return request<JobListResponse>(`/v1/jobs?${params.toString()}`);
}

export function getPublicJob(slug: string) {
  return request<{ job: PublicJob }>(`/v1/jobs/${encodeURIComponent(slug)}`);
}

export function listPublicJobSitemap() {
  return request<{ jobs: Array<{ slug: string; updatedAt: string }> }>('/v1/jobs/sitemap');
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

export function siteOrigin(): string {
  return (process.env.SITE_ORIGIN || process.env.URL || 'https://aitrainers.coach').replace(/\/$/, '');
}

export function apiOrigin(): string {
  if (typeof window !== 'undefined') {
    return '';
  }
  if (process.env.BOOKING_API_ORIGIN) {
    return process.env.BOOKING_API_ORIGIN.replace(/\/$/, '');
  }
  return process.env.NODE_ENV === 'production' ? 'https://api.aitrainers.coach' : 'http://127.0.0.1:4000';
}

async function fetchJsonServer<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${apiOrigin()}${path}`, {
      headers: { accept: 'application/json' },
      cache: 'no-store',
    });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchOpportunitiesServer(): Promise<OpportunityListResponse | null> {
  return fetchJsonServer<OpportunityListResponse>('/v1/opportunities');
}

export async function fetchPublicJobsServer(filters: JobListFilters = {}): Promise<JobListResponse | null> {
  const params = new URLSearchParams();
  params.set('page', String(filters.page ?? 1));
  params.set('pageSize', String(filters.pageSize ?? 20));
  if (filters.sort) params.set('sort', filters.sort);
  return fetchJsonServer<JobListResponse>(`/v1/jobs?${params.toString()}`);
}

export async function fetchPublicJobServer(slug: string): Promise<PublicJob | null> {
  try {
    const response = await fetch(`${apiOrigin()}/v1/jobs/${encodeURIComponent(slug)}`, {
      headers: { accept: 'application/json' },
    });
    if (!response.ok) {
      return null;
    }
    const data = (await response.json()) as { job: PublicJob };
    return data.job;
  } catch {
    return null;
  }
}

export async function fetchJobSitemapServer(): Promise<Array<{ slug: string; updatedAt: string }>> {
  try {
    const response = await fetch(`${apiOrigin()}/v1/jobs/sitemap`, {
      headers: { accept: 'application/json' },
    });
    if (!response.ok) {
      return [];
    }
    const data = (await response.json()) as { jobs: Array<{ slug: string; updatedAt: string }> };
    return data.jobs;
  } catch {
    return [];
  }
}

export function jobPostingJsonLd(job: PublicJob, canonical: string): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    '@context': 'https://schema.org/',
    '@type': 'JobPosting',
    title: job.title,
    description: job.descriptionText || job.title,
    url: canonical,
    hiringOrganization: {
      '@type': 'Organization',
      name: job.companyName,
      ...(job.companyLogoUrl ? { logo: job.companyLogoUrl } : {}),
    },
  };
  if (job.postedAt) payload.datePosted = job.postedAt.slice(0, 10);
  if (job.expiresAt) payload.validThrough = job.expiresAt;
  const employmentMap: Record<string, string> = {
    'full-time': 'FULL_TIME',
    'part-time': 'PART_TIME',
    contract: 'CONTRACTOR',
    temporary: 'TEMPORARY',
    internship: 'INTERN',
  };
  const employmentType = job.employmentType ? employmentMap[job.employmentType] : undefined;
  if (employmentType) payload.employmentType = employmentType;
  if (job.remoteType === 'remote') {
    payload.jobLocationType = 'TELECOMMUTE';
  }
  if (job.location) {
    payload.jobLocation = {
      '@type': 'Place',
      address: { '@type': 'PostalAddress', streetAddress: job.location },
    };
  }
  if (job.salaryMin != null || job.salaryMax != null) {
    payload.baseSalary = {
      '@type': 'MonetaryAmount',
      currency: job.salaryCurrency || 'USD',
      value: {
        '@type': 'QuantitativeValue',
        ...(job.salaryMin != null ? { minValue: job.salaryMin } : {}),
        ...(job.salaryMax != null ? { maxValue: job.salaryMax } : {}),
      },
    };
  }
  return payload;
}
