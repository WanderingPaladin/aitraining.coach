'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ApiError, submitFeedback } from '../../lib/api';
import { DETAIL_COPY, TOPIC_QUESTIONS, deviceTypeFromWidth } from '../../lib/feedback-context';
import {
  clearFeedbackDraft,
  readFeedbackDraft,
  writeFeedbackDraft,
} from '../../lib/feedback-storage';
import type { FeedbackCategory, FeedbackDraft, FeedbackStep } from '../../lib/feedback-types';
import { emptyFeedbackDraft, FEEDBACK_MAX_MESSAGE } from '../../lib/feedback-types';
import { popFeedbackStep, pushFeedbackStep } from '../../lib/feedback-nav';
import {
  buildOpenFeedbackDraft,
  coerceRenderableDraft,
  nextAfterCategory,
  nextAfterContext,
  nextAfterDetails,
  warnInvalidFeedbackState,
} from '../../lib/feedback-state';
import { isNonEmptyFeedback, isValidFeedbackEmail, trimFeedbackMessage, feedbackClientIssue } from '../../lib/feedback-validation';
import { trackingIds } from '../../lib/tracking';
import { useAuth } from '../components/AuthProvider';
import { useFeedbackContext } from './useFeedbackContext';

type OpenOptions = {
  category?: FeedbackCategory;
  rating?: number | null;
  step?: Exclude<FeedbackStep, 'closed'>;
};

let feedbackUserActionEpoch = 0;

function markFeedbackUserAction(local: { current: number }) {
  feedbackUserActionEpoch += 1;
  local.current = feedbackUserActionEpoch;
}

function composedMessage(draft: FeedbackDraft): string {
  const parts: string[] = [];
  if (draft.contextAnswer) parts.push(`Context: ${draft.contextAnswer}`);
  if (draft.clarify.trim()) parts.push(`Would have been clearer: ${draft.clarify.trim()}`);
  if (draft.blocker != null) parts.push(`Blocked progress: ${draft.blocker ? 'yes' : 'no'}`);
  if (draft.message.trim()) parts.push(draft.message.trim());
  return parts.join('\n\n').slice(0, FEEDBACK_MAX_MESSAGE);
}

export function useFeedback() {
  const { user } = useAuth();
  const { pathname, pageUrl, context } = useFeedbackContext();
  const launcherRef = useRef<HTMLButtonElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<FeedbackDraft>(() => emptyFeedbackDraft(pathname));
  const [error, setError] = useState('');
  const [submission, setSubmission] = useState<{
    conversationId: string | null;
    contactEmail: string | null;
  } | null>(null);
  const restored = useRef(false);
  const userActionEpoch = useRef(0);

  useLayoutEffect(() => {
    if (restored.current) return;
    restored.current = true;
    if (userActionEpoch.current !== 0 || feedbackUserActionEpoch !== 0) return;
    const saved = readFeedbackDraft();
    if (saved) setDraft(coerceRenderableDraft(saved, context));
  }, [context]);

  useEffect(() => {
    setDraft((current) => {
      const next = coerceRenderableDraft(current, context);
      return next.step === current.step && next.category === current.category ? current : next;
    });
  }, [context, pathname]);

  useEffect(() => {
    warnInvalidFeedbackState(draft, context);
  }, [context, draft]);

  useEffect(() => {
    if (!open) return;
    if (draft.step === 'success') {
      clearFeedbackDraft();
      return;
    }
    writeFeedbackDraft({ ...draft, pagePath: pathname });
  }, [draft, open, pathname]);

  const goToStep = useCallback(
    (step: Exclude<FeedbackStep, 'closed'>, patch: Partial<FeedbackDraft> = {}) => {
      setDraft((current) => {
        const skipHistory = step === 'submitting' || step === 'success' || step === 'error';
        const history: FeedbackDraft['history'] =
          step === 'success' || step === 'error'
            ? ['welcome']
            : skipHistory
              ? current.history.length
                ? current.history
                : [current.step]
              : pushFeedbackStep(current.history, current.step, step);
        const next: FeedbackDraft = {
          ...current,
          ...patch,
          step,
          history,
        };
        return coerceRenderableDraft(next, context);
      });
    },
    [context],
  );

  const update = useCallback((patch: Partial<FeedbackDraft>) => {
    setDraft((current) => coerceRenderableDraft({ ...current, ...patch }, context));
  }, [context]);

  const focusPanel = useCallback(() => {
    requestAnimationFrame(() => panelRef.current?.focus());
  }, []);

  const focusLauncher = useCallback(() => {
    requestAnimationFrame(() => launcherRef.current?.focus());
  }, []);

  const openPanel = useCallback(
    (options?: OpenOptions) => {
      setError('');
      setOpen(true);
      setDraft((current) => {
        if (options?.step === 'welcome' && !options.category) {
          const next = buildOpenFeedbackDraft(current, { pathname, context });
          if (options.rating != null) next.rating = options.rating;
          return next;
        }
        if (current.step === 'success' || current.step === 'error') {
          const fresh = emptyFeedbackDraft(pathname);
          if (options?.category) fresh.category = options.category;
          if (options?.rating != null) fresh.rating = options.rating;
          if (options?.step && options.step !== 'welcome') {
            fresh.step = options.step;
            fresh.history = pushFeedbackStep(['welcome'], 'welcome', options.step);
          }
          return coerceRenderableDraft(fresh, context);
        }
        const next = { ...current, pagePath: pathname };
        if (options?.category) next.category = options.category;
        if (options?.rating != null) next.rating = options.rating;
        if (options?.step) {
          next.step = options.step;
          if (options.step === 'welcome') next.history = ['welcome'];
          else next.history = pushFeedbackStep(current.history.length ? current.history : ['welcome'], current.step, options.step);
        }
        return coerceRenderableDraft(next, context);
      });
      focusPanel();
    },
    [context, focusPanel, pathname],
  );

  const openFeedback = useCallback(
    (options?: { category?: FeedbackCategory }) => {
      markFeedbackUserAction(userActionEpoch);
      setError('');
      setOpen(true);
      setDraft((current) => buildOpenFeedbackDraft(current, {
        pathname,
        context,
        category: options?.category,
      }));
      focusPanel();
    },
    [context, focusPanel, pathname],
  );

  const closePanel = useCallback(() => {
    setOpen(false);
    focusLauncher();
  }, [focusLauncher]);

  const resetAndClose = useCallback(() => {
    clearFeedbackDraft();
    setDraft(emptyFeedbackDraft(pathname));
    setError('');
    setSubmission(null);
    setOpen(false);
    focusLauncher();
  }, [focusLauncher, pathname]);

  const selectCategory = useCallback(
    (category: FeedbackCategory) => {
      setDraft((current) => {
        const same = current.category === category;
        const step = nextAfterCategory(category, Boolean(context));
        return coerceRenderableDraft({
          ...current,
          category,
          subcategory: same ? current.subcategory : null,
          contextFollowUpId: same ? current.contextFollowUpId : null,
          contextAnswer: same ? current.contextAnswer : null,
          step,
          history: pushFeedbackStep(current.history, current.step, step),
        }, context);
      });
    },
    [context],
  );

  const selectContext = useCallback(
    (answer: string) => {
      if (!draft.category || !context) return;
      const option = context.options.find((item) => item.label === answer || item.id === answer);
      const followUp = option && !draft.contextFollowUpId ? context.followUp?.[option.id] : null;
      if (followUp) {
        update({
          contextAnswer: option?.label ?? answer,
          contextFollowUpId: option?.id ?? answer,
          step: 'context',
        });
        return;
      }
      const followOption = context.followUp?.[draft.contextFollowUpId ?? '']?.options.find(
        (item) => item.label === answer || item.id === answer,
      );
      const composed = [draft.contextAnswer, followOption?.label ?? answer].filter(Boolean).join(' · ');
      goToStep(nextAfterContext(draft.category), { contextAnswer: composed });
    },
    [context, draft.category, draft.contextAnswer, draft.contextFollowUpId, goToStep, update],
  );

  const selectTopic = useCallback((subcategory: string) => {
    goToStep('details', { subcategory });
  }, [goToStep]);

  const setMessage = useCallback((message: string) => {
    update({ message: trimFeedbackMessage(message) });
  }, [update]);

  const setClarify = useCallback((clarify: string) => {
    update({ clarify: trimFeedbackMessage(clarify) });
  }, [update]);

  const continueFromDetails = useCallback(() => {
    if (!draft.category) return;
    if (draft.category !== 'general' && draft.category !== 'question' && !isNonEmptyFeedback(draft.message)) {
      setError('Please add a short comment before continuing.');
      return;
    }
    const quality = feedbackClientIssue(draft.message, draft.rating != null);
    if (quality && draft.category !== 'general') {
      setError(quality);
      return;
    }
    setError('');
    goToStep(nextAfterDetails(draft.category));
  }, [draft.category, draft.message, draft.rating, goToStep]);

  const goBack = useCallback(() => {
    setError('');
    let exited = false;
    setDraft((current) => {
      const live = coerceRenderableDraft(current, context);
      const result = popFeedbackStep({
        step: live.step,
        history: live.history,
        contextFollowUpId: live.contextFollowUpId,
      });
      exited = result.exited;
      if (result.exited) return live;
      return coerceRenderableDraft({
        ...live,
        step: result.step,
        history: result.history,
        contextFollowUpId: result.contextFollowUpId,
      }, context);
    });
    return exited;
  }, [context]);

  const buildPayload = useCallback((next: FeedbackDraft) => {
    if (!next.category) return null;
    const message = composedMessage(next);
    if (!message && next.rating == null) return null;
    const quality = feedbackClientIssue(message, next.rating != null);
    if (quality) {
      setError(quality);
      return null;
    }
    return {
      category: next.category,
      subcategory: next.subcategory,
      message,
      rating: next.rating,
      pagePath: pathname,
      pageUrl,
      email: next.wantFollowUp && next.email.trim() ? next.email.trim().toLowerCase() : null,
      ...trackingIds(),
      companyWebsite: honeypotRef.current?.value ?? '',
      metadata: {
        deviceType: deviceTypeFromWidth(window.innerWidth),
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        referrer: document.referrer || '',
      },
    };
  }, [pageUrl, pathname]);

  const submit = useCallback(async (overrides?: Partial<FeedbackDraft>) => {
    const next = { ...draft, ...overrides };
    const payload = buildPayload(next);
    if (!payload) {
      setError((current) => current || 'Please add a short comment before sending.');
      update({ ...overrides, step: draft.category ? 'details' : 'welcome' });
      return null;
    }
    if (next.wantFollowUp && !isValidFeedbackEmail(next.email)) {
      setError('Enter a valid email, like you@example.com.');
      update({ ...overrides, step: 'email' });
      return null;
    }
    setError('');
    goToStep('submitting', overrides);
    try {
      const result = await submitFeedback(payload);
      clearFeedbackDraft();
      setSubmission({
        conversationId: result.conversation?.id ?? result.feedback.conversationId ?? null,
        contactEmail: result.conversation?.contactEmail ?? payload.email ?? null,
      });
      goToStep('success', overrides);
      return result;
    } catch (err) {
      const detail = err instanceof ApiError ? err.details?.find((item) => item.path === 'message')?.message : null;
      setError(detail || (err instanceof Error ? err.message : 'Something went wrong while sending your feedback.'));
      goToStep('error', overrides);
      return null;
    }
  }, [buildPayload, draft, goToStep, update]);

  const submitRatingOnly = useCallback(async (rating: number, pagePath = pathname) => {
    await submitFeedback({
      category: 'general',
      rating,
      pagePath,
      pageUrl: window.location.href,
      ...trackingIds(),
      companyWebsite: honeypotRef.current?.value ?? '',
      metadata: {
        deviceType: deviceTypeFromWidth(window.innerWidth),
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        referrer: document.referrer || '',
      },
    });
  }, [pathname]);

  const chooseFollowUp = useCallback(
    (wantFollowUp: boolean) => {
      if (!wantFollowUp) {
        void submit({ wantFollowUp: false, email: '' });
        return;
      }
      update({
        wantFollowUp: true,
        email: draft.email || user?.email || '',
        step: 'email',
        history: pushFeedbackStep(draft.history, draft.step, 'email'),
      });
    },
    [draft.email, draft.history, draft.step, submit, update, user?.email],
  );

  const startOver = useCallback(() => {
    markFeedbackUserAction(userActionEpoch);
    clearFeedbackDraft();
    setError('');
    setSubmission(null);
    setDraft(emptyFeedbackDraft(pathname));
  }, [pathname]);

  const canSendDetails = useMemo(() => {
    if (draft.category === 'general') return isNonEmptyFeedback(draft.message) || draft.rating != null;
    return isNonEmptyFeedback(draft.message);
  }, [draft.category, draft.message, draft.rating]);

  const renderDraft = useMemo(() => coerceRenderableDraft(draft, context), [context, draft]);

  const question = useMemo(() => {
    if (renderDraft.step === 'context') {
      const follow = renderDraft.contextFollowUpId ? context?.followUp?.[renderDraft.contextFollowUpId] : null;
      return follow?.question ?? context?.question ?? '';
    }
    if (renderDraft.step === 'topic' && renderDraft.category) return TOPIC_QUESTIONS[renderDraft.category] ?? '';
    if (renderDraft.step === 'details' && renderDraft.category) return DETAIL_COPY[renderDraft.category].question;
    if (renderDraft.step === 'clarify') return 'What would have made this clearer?';
    if (renderDraft.step === 'blocker') return 'Did this stop you from completing what you were trying to do?';
    if (renderDraft.step === 'rating') return 'How has your experience with AI Trainers been so far?';
    if (renderDraft.step === 'follow_up') return 'Would you like us to follow up?';
    return '';
  }, [context, renderDraft]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape' && window.innerWidth >= 768) {
        event.preventDefault();
        closePanel();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closePanel, open]);

  return {
    open,
    draft: renderDraft,
    error,
    context,
    pathname,
    launcherRef,
    honeypotRef,
    panelRef,
    question,
    canSendDetails,
    userEmail: user?.email ?? '',
    openPanel,
    openFeedback,
    closePanel,
    resetAndClose,
    selectCategory,
    selectContext,
    selectTopic,
    setMessage,
    setClarify,
    continueFromDetails,
    goBack,
    chooseFollowUp,
    setEmail: (email: string) => update({ email }),
    setRating: (rating: number) => goToStep('details', { rating }),
    setBlocker: (blocker: boolean) => goToStep('follow_up', { blocker }),
    skipClarify: () => goToStep('follow_up'),
    submit,
    submitRatingOnly,
    startOver,
    submission,
    retry: () => {
      setError('');
      goToStep('follow_up');
    },
    keepMessage: () => {
      setError('');
      goToStep(draft.category ? 'details' : 'welcome');
    },
  };
}

export type FeedbackController = ReturnType<typeof useFeedback>;
