import { trackingIds } from '../tracking';
import { ApiError } from '../api';
import { COURSE_SLUG } from './course';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      ...init,
      credentials: 'include',
      headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) },
    });
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', 'Could not reach the AI Trainers service.');
  }
  if (response.headers.get('content-type')?.includes('application/pdf')) {
    return (await response.blob()) as T;
  }
  const data = (await response.json().catch(() => ({}))) as T & {
    error?: { code?: string; message?: string };
  };
  if (!response.ok) {
    throw new ApiError(response.status, data.error?.code ?? 'REQUEST_ERROR', data.error?.message ?? 'Something went wrong.');
  }
  return data;
}

function identity() {
  return { visitorId: trackingIds().visitorId || undefined, courseSlug: COURSE_SLUG };
}

export type LearnProgress = {
  currentModule: number;
  completedModules: number[];
  startedModules: number[];
  quizResults: Record<string, boolean | number | string> | null;
  lastLesson: string | null;
  percent: number;
  completedAt: string | null;
};

export async function fetchLearnProgress(): Promise<LearnProgress> {
  const { visitorId } = identity();
  const params = new URLSearchParams({ courseSlug: COURSE_SLUG });
  if (visitorId) params.set('visitorId', visitorId);
  const result = await request<{ progress: LearnProgress }>(`/v1/learn/progress?${params}`);
  return result.progress;
}

export async function saveLearnProgress(patch: Partial<LearnProgress> & { completedAt?: boolean }) {
  return request<{ progress: LearnProgress }>('/v1/learn/progress', {
    method: 'PUT',
    body: JSON.stringify({ ...identity(), ...patch }),
  });
}

export type PublicQuestion = {
  id: string;
  type: 'mcq' | 'yesno' | 'compare' | 'written';
  prompt: string;
  stimulus?: string;
  options?: Array<{ id: string; label: string }>;
  helper?: string;
  placeholder?: string;
};

export async function startAssessment(attemptId?: string) {
  return request<{
    attempt: { id: string; submitted: boolean; answers: Record<string, string> };
    questions: PublicQuestion[];
  }>('/v1/learn/assessment/attempts', {
    method: 'POST',
    body: JSON.stringify({ ...identity(), attemptId }),
  });
}

export async function saveAssessmentAnswers(id: string, answers: Record<string, string>) {
  return request(`/v1/learn/assessment/attempts/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ ...identity(), answers }),
  });
}

export type AssessmentResult = {
  attemptId: string;
  submitted: boolean;
  finalScore?: number;
  passed?: boolean;
  passScore?: number;
  level?: string;
  levelCopy?: { title: string; body: string };
  categories?: Array<{ key: string; label: string; score: number; band: string; insight?: string }>;
  strongest?: { label: string; score: number } | null;
  opportunity?: { label: string; score: number } | null;
  recommendations?: string[];
  usBased?: boolean | null;
  certificate?: { credentialId: string; issuedAt: string; learnerDisplayName: string } | null;
  answers?: Record<string, string>;
  questions?: PublicQuestion[];
};

export async function submitAssessment(
  id: string,
  payload: {
    answers: Record<string, string>;
    firstName: string;
    lastName?: string;
    email: string;
    usBased: boolean;
    situation: string;
    state?: string;
    shareScore?: boolean;
    companyWebsite?: string;
  },
) {
  return request<AssessmentResult>(`/v1/learn/assessment/attempts/${id}/submit`, {
    method: 'POST',
    body: JSON.stringify({ ...identity(), ...payload }),
  });
}

export async function fetchAttempt(id: string) {
  const { visitorId } = identity();
  const params = new URLSearchParams();
  if (visitorId) params.set('visitorId', visitorId);
  const suffix = params.size ? `?${params}` : '';
  return request<AssessmentResult>(`/v1/learn/assessment/attempts/${id}${suffix}`);
}

export async function fetchPublicCertificate(credentialId: string) {
  return request<{
    certificate: {
      credentialId: string;
      course: string;
      issuedTo: string;
      issuedAt: string;
      status: string;
      assessment: string;
      score: number | null;
      verifyPath: string;
    };
  }>(`/v1/learn/certificates/${encodeURIComponent(credentialId)}`);
}

export async function downloadCertificatePdf(credentialId: string) {
  const response = await fetch(`/v1/learn/certificates/${encodeURIComponent(credentialId)}/pdf`, {
    credentials: 'include',
  });
  if (!response.ok) throw new ApiError(response.status, 'PDF_ERROR', 'Could not download the certificate.');
  return response.blob();
}
