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
      headers: {
        'content-type': 'application/json',
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new ApiError(
      0,
      'NETWORK_ERROR',
      'Could not reach the booking service. Make sure the API is running.',
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
