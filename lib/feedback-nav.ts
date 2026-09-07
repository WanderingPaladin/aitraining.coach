import type { FeedbackStep } from './feedback-types';

export type NavigableFeedbackStep = Exclude<FeedbackStep, 'closed'>;

export function pushFeedbackStep(
  history: NavigableFeedbackStep[],
  current: NavigableFeedbackStep,
  next: NavigableFeedbackStep,
): NavigableFeedbackStep[] {
  const base = history.length > 0 ? history : [current];
  if (base[base.length - 1] === next) return base;
  return [...base, next];
}

export function popFeedbackStep(input: {
  step: NavigableFeedbackStep;
  history: NavigableFeedbackStep[];
  contextFollowUpId: string | null;
}): {
  exited: boolean;
  step: NavigableFeedbackStep;
  history: NavigableFeedbackStep[];
  contextFollowUpId: string | null;
} {
  if (input.step === 'context' && input.contextFollowUpId) {
    return {
      exited: false,
      step: input.step,
      history: input.history.length > 0 ? input.history : [input.step],
      contextFollowUpId: null,
    };
  }
  const history = input.history.length > 0 ? input.history : [input.step];
  if (history.length <= 1) {
    return {
      exited: true,
      step: history[0] ?? 'welcome',
      history,
      contextFollowUpId: null,
    };
  }
  const next = history.slice(0, -1);
  return {
    exited: false,
    step: next[next.length - 1] ?? 'welcome',
    history: next,
    contextFollowUpId: input.contextFollowUpId,
  };
}
