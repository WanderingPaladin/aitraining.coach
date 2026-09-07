import { DETAIL_COPY, TOPIC_OPTIONS } from './feedback-context';
import type { RouteContextPrompt } from './feedback-types';
import {
  emptyFeedbackDraft,
  FEEDBACK_CATEGORIES,
  FEEDBACK_STEPS,
  type FeedbackCategory,
  type FeedbackDraft,
  type FeedbackStep,
} from './feedback-types';

export const ASSISTANT_STATE_VERSION = 2;

export type NavigableFeedbackStep = Exclude<FeedbackStep, 'closed'>;

const RENDERABLE_STEPS = FEEDBACK_STEPS.filter((step) => step !== 'closed') as NavigableFeedbackStep[];
export const VALID_FEEDBACK_STEPS = RENDERABLE_STEPS;

const STEP_ALIASES: Record<string, NavigableFeedbackStep> = {
  category: 'welcome',
  subcategory: 'topic',
  submitted: 'success',
  home: 'welcome',
};

export function nextAfterCategory(
  category: FeedbackCategory,
  hasContext: boolean,
): Exclude<FeedbackStep, 'closed' | 'submitting'> {
  if (hasContext) return 'context';
  if (category === 'general') return 'rating';
  if (category === 'question') return 'details';
  return 'topic';
}

export function nextAfterContext(category: FeedbackCategory): Exclude<FeedbackStep, 'closed' | 'submitting'> {
  if (category === 'general') return 'rating';
  if (category === 'question') return 'details';
  return 'topic';
}

export function nextAfterDetails(category: FeedbackCategory): Exclude<FeedbackStep, 'closed' | 'submitting'> {
  if (category === 'confusing') return 'clarify';
  if (category === 'problem') return 'blocker';
  return 'follow_up';
}

export function isFeedbackCategory(value: unknown): value is FeedbackCategory {
  return typeof value === 'string' && (FEEDBACK_CATEGORIES as readonly string[]).includes(value);
}

export function normalizeFeedbackStep(step: unknown): NavigableFeedbackStep {
  if (typeof step !== 'string' || step === 'closed') return 'welcome';
  const aliased = STEP_ALIASES[step] ?? step;
  return RENDERABLE_STEPS.includes(aliased as NavigableFeedbackStep)
    ? (aliased as NavigableFeedbackStep)
    : 'welcome';
}

function replaceHistoryStep(history: NavigableFeedbackStep[], step: NavigableFeedbackStep): NavigableFeedbackStep[] {
  const normalized = history.map(normalizeFeedbackStep);
  if (!normalized.length) return step === 'welcome' ? ['welcome'] : ['welcome', step];
  if (normalized[normalized.length - 1] === step) return normalized;
  return [...normalized.slice(0, -1), step];
}

export function coerceRenderableDraft(
  draft: FeedbackDraft,
  context: RouteContextPrompt | null,
): FeedbackDraft {
  const category = isFeedbackCategory(draft.category) ? draft.category : null;
  let step = normalizeFeedbackStep(draft.step);
  let history: NavigableFeedbackStep[] = (draft.history?.length ? draft.history : [step]).map(normalizeFeedbackStep);

  if (step === 'context' && (!context || !category)) {
    step = category ? nextAfterContext(category) : 'welcome';
    history = replaceHistoryStep(history.length ? history : ['welcome'], step);
  }

  if ((step === 'topic' || step === 'rating' || step === 'details' || step === 'clarify' || step === 'blocker') && !category) {
    step = 'welcome';
    history = ['welcome'];
  }

  if (step === 'topic' && category && !TOPIC_OPTIONS[category]) {
    step = nextAfterContext(category);
    history = replaceHistoryStep(history, step);
  }

  if (step === 'details' && category && !DETAIL_COPY[category]) {
    step = 'welcome';
    history = ['welcome'];
  }

  return {
    ...draft,
    category,
    step,
    history: history.length ? history : ['welcome'],
  };
}

export function buildOpenFeedbackDraft(
  current: FeedbackDraft,
  input: {
    pathname: string;
    context: RouteContextPrompt | null;
    category?: FeedbackCategory;
  },
): FeedbackDraft {
  const base =
    current.step === 'success' || current.step === 'error'
      ? emptyFeedbackDraft(input.pathname)
      : { ...current, pagePath: input.pathname };

  if (input.category) {
    const step = nextAfterCategory(input.category, Boolean(input.context));
    const history: NavigableFeedbackStep[] = step === 'welcome' ? ['welcome'] : ['welcome', step];
    return coerceRenderableDraft(
      {
        ...base,
        category: input.category,
        subcategory: base.category === input.category ? base.subcategory : null,
        contextFollowUpId: base.category === input.category ? base.contextFollowUpId : null,
        contextAnswer: base.category === input.category ? base.contextAnswer : null,
        step,
        history,
      },
      input.context,
    );
  }

  return coerceRenderableDraft(
    {
      ...base,
      step: 'welcome',
      history: ['welcome'],
    },
    input.context,
  );
}

export function warnInvalidFeedbackState(draft: FeedbackDraft, context: RouteContextPrompt | null): void {
  if (process.env.NODE_ENV === 'production') return;
  const coerced = coerceRenderableDraft(draft, context);
  if (coerced.step !== draft.step || coerced.category !== draft.category) {
    console.error('[Assistant] Invalid feedback state normalized:', {
      step: draft.step,
      category: draft.category,
      hasContext: Boolean(context),
      nextStep: coerced.step,
    });
  }
}
