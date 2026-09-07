import type { FeedbackDraft, FeedbackPromptKind } from './feedback-types';
import { emptyFeedbackDraft } from './feedback-types';
import { ASSISTANT_STATE_VERSION, coerceRenderableDraft, normalizeFeedbackStep } from './feedback-state';
import { getRouteContext } from './feedback-context';

export const FEEDBACK_DRAFT_KEY = 'ait.feedback.draft.v2';
const LEGACY_DRAFT_KEY = 'ait.feedback.draft.v1';
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

type PersistedDraft = Partial<FeedbackDraft> & { version?: number };

function parseDraft(raw: string | null): PersistedDraft | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PersistedDraft;
  } catch {
    return null;
  }
}

export function readFeedbackDraft(): FeedbackDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const parsed = parseDraft(sessionStorage.getItem(FEEDBACK_DRAFT_KEY)) ?? parseDraft(sessionStorage.getItem(LEGACY_DRAFT_KEY));
    if (!parsed) return null;
    const pathname = parsed.pagePath || '/';
    if (parsed.version != null && parsed.version !== ASSISTANT_STATE_VERSION) {
      sessionStorage.removeItem(FEEDBACK_DRAFT_KEY);
      sessionStorage.removeItem(LEGACY_DRAFT_KEY);
      return null;
    }
    const merged = { ...emptyFeedbackDraft(pathname), ...parsed, step: normalizeFeedbackStep(parsed.step) };
    const history = (parsed.history?.length ? parsed.history : merged.step !== 'welcome' ? ['welcome', merged.step] : [merged.step]).map(
      normalizeFeedbackStep,
    );
    const hash = window.location.hash;
    return coerceRenderableDraft({ ...merged, history }, getRouteContext(pathname, hash));
  } catch {
    return null;
  }
}

export function writeFeedbackDraft(draft: FeedbackDraft): void {
  try {
    sessionStorage.setItem(
      FEEDBACK_DRAFT_KEY,
      JSON.stringify({ version: ASSISTANT_STATE_VERSION, ...draft }),
    );
    sessionStorage.removeItem(LEGACY_DRAFT_KEY);
  } catch {
    // ignore
  }
}

export function clearFeedbackDraft(): void {
  try {
    sessionStorage.removeItem(FEEDBACK_DRAFT_KEY);
    sessionStorage.removeItem(LEGACY_DRAFT_KEY);
  } catch {
    // ignore
  }
}
