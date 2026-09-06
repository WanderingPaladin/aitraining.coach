import { FEEDBACK_MAX_MESSAGE } from './feedback-types';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function trimFeedbackMessage(value: string): string {
  return value.replace(/\0/g, '').slice(0, FEEDBACK_MAX_MESSAGE);
}

export function isNonEmptyFeedback(value: string): boolean {
  return value.trim().length > 0;
}

export function isValidFeedbackEmail(value: string): boolean {
  const email = value.trim().toLowerCase();
  return email.length >= 6 && email.length <= 254 && EMAIL_RE.test(email);
}
