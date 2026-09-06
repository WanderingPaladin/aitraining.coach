import { FEEDBACK_MAX_MESSAGE } from './feedback-types';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidFeedbackEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

export function trimFeedbackMessage(value: string): string {
  return value.replace(/\0/g, '').slice(0, FEEDBACK_MAX_MESSAGE);
}

export function isNonEmptyFeedback(value: string): boolean {
  return value.trim().length > 0;
}

export function isLowQualityFeedback(message: string): boolean {
  const text = message.trim();
  if (text.length < 8) return false;
  const compact = text.replace(/\s+/g, '');
  const letters = compact.replace(/[^a-zA-Z]/g, '');
  if (letters.length < 3) return true;
  const counts = new Map<string, number>();
  for (const char of compact.toLowerCase()) {
    counts.set(char, (counts.get(char) ?? 0) + 1);
  }
  const max = Math.max(...counts.values());
  if (compact.length >= 8 && max / compact.length >= 0.85) return true;
  return false;
}

export function feedbackClientIssue(message: string, hasRating: boolean): string | null {
  const text = message.trim();
  if (!text && !hasRating) {
    return 'Please add a little more detail so we can understand your feedback.';
  }
  if (isLowQualityFeedback(text)) {
    return 'Please describe what happened or what you would like us to improve.';
  }
  if (text && text.length < 8 && !hasRating) {
    return 'Please add a little more detail so we can understand your feedback.';
  }
  return null;
}
