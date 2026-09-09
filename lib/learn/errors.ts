import { ApiError } from '../api';

const FALLBACK = "We couldn't complete that action. Your completed work has been preserved. Please try again.";

export function learnErrorTitle(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return 'Your session expired';
    if (error.status === 403 || error.status === 404) return "We couldn't load your assessment.";
    if (error.code === 'NETWORK_ERROR' || error.status === 0) return "We couldn't reach the course service.";
    if (error.code === 'ALREADY_SUBMITTED' || error.status === 409) return 'This assessment was already submitted';
    if (error.status >= 500 || error.code === 'ASSESSMENT_STORAGE_UNAVAILABLE') {
      return "We couldn't load your assessment.";
    }
  }
  return "We couldn't load your assessment.";
}

export function learnErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return 'Your session expired. Please sign in again.';
    if (error.status === 403) return 'This assessment is not available.';
    if (error.status === 404) return "We couldn't find this assessment attempt.";
    if (error.code === 'ALREADY_SUBMITTED' || error.status === 409) {
      return 'Your assessment has already been submitted.';
    }
    if (error.code === 'IDENTITY_REQUIRED') {
      return 'We could not start the assessment. Refresh the page and try again.';
    }
    if (error.code === 'ASSESSMENT_STORAGE_UNAVAILABLE' || error.status === 503) {
      return "We couldn't save this right now. Your completed work has been preserved. Please try again.";
    }
    if (error.code === 'NETWORK_ERROR') {
      return "We couldn't reach the course service. Check your connection and try again.";
    }
    if (error.status >= 500 || error.message === 'Unexpected server error') return FALLBACK;
    if (error.message) return error.message;
    return FALLBACK;
  }
  if (error instanceof Error && error.message && error.message !== 'Unexpected server error') {
    return error.message;
  }
  return FALLBACK;
}
