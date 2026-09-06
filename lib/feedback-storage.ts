import type { FeedbackDraft, FeedbackPromptKind } from './feedback-types';
import { emptyFeedbackDraft } from './feedback-types';

export const FEEDBACK_DRAFT_KEY = 'ait.feedback.draft.v1';
export const FEEDBACK_PROMPT_EVENT = 'ait-feedback-prompt';
export const FEEDBACK_PENDING_PROMPT_KEY = 'ait.feedback.pending-prompt';

export function promptStorageKey(kind: FeedbackPromptKind): string {
  return `ait.feedback.prompt.${kind}`;
}

export function wasPromptSeen(kind: FeedbackPromptKind): boolean {
  try {
    return sessionStorage.getItem(promptStorageKey(kind)) === '1';
  } catch {
    return true;
  }
}

export function markPromptSeen(kind: FeedbackPromptKind): void {
  try {
    sessionStorage.setItem(promptStorageKey(kind), '1');
  } catch {
    // ignore quota / private mode
  }
}

export function requestFeedbackPrompt(kind: FeedbackPromptKind): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(FEEDBACK_PROMPT_EVENT, { detail: { kind } }));
}

export function setPendingFeedbackPrompt(kind: FeedbackPromptKind): void {
  try {
    sessionStorage.setItem(FEEDBACK_PENDING_PROMPT_KEY, kind);
  } catch {
    // ignore
  }
}

export function consumePendingFeedbackPrompt(): FeedbackPromptKind | null {
  try {
    const kind = sessionStorage.getItem(FEEDBACK_PENDING_PROMPT_KEY);
    sessionStorage.removeItem(FEEDBACK_PENDING_PROMPT_KEY);
    if (kind === 'application' || kind === 'booking' || kind === 'opportunities' || kind === 'profile') {
      return kind;
    }
  } catch {
    // ignore
  }
  return null;
}

export function readFeedbackDraft(): FeedbackDraft | null {
  try {
    const raw = sessionStorage.getItem(FEEDBACK_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<FeedbackDraft>;
    return { ...emptyFeedbackDraft(parsed.pagePath || '/'), ...parsed };
  } catch {
    return null;
  }
}

export function writeFeedbackDraft(draft: FeedbackDraft): void {
  try {
    sessionStorage.setItem(FEEDBACK_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // ignore
  }
}

export function clearFeedbackDraft(): void {
  try {
    sessionStorage.removeItem(FEEDBACK_DRAFT_KEY);
  } catch {
    // ignore
  }
}
