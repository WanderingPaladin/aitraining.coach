'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ApiError, submitFeedback } from '../../lib/api';
import { DETAIL_COPY, TOPIC_QUESTIONS, deviceTypeFromWidth } from '../../lib/feedback-context';
import {
  clearFeedbackDraft,
  readFeedbackDraft,
  writeFeedbackDraft,
} from '../../lib/feedback-storage';
import type { FeedbackCategory, FeedbackDraft, FeedbackStep } from '../../lib/feedback-types';
import { emptyFeedbackDraft, FEEDBACK_MAX_MESSAGE } from '../../lib/feedback-types';
import { isNonEmptyFeedback, isValidFeedbackEmail, trimFeedbackMessage, feedbackClientIssue } from '../../lib/feedback-validation';
import { trackingIds } from '../../lib/tracking';
import { useAuth } from '../components/AuthProvider';
import { useFeedbackContext } from './useFeedbackContext';

type OpenOptions = {
  category?: FeedbackCategory;
  rating?: number | null;
  step?: Exclude<FeedbackStep, 'closed'>;
};

function composedMessage(draft: FeedbackDraft): string {
  const parts: string[] = [];
  if (draft.contextAnswer) parts.push(`Context: ${draft.contextAnswer}`);
  if (draft.clarify.trim()) parts.push(`Would have been clearer: ${draft.clarify.trim()}`);
  if (draft.blocker != null) parts.push(`Blocked progress: ${draft.blocker ? 'yes' : 'no'}`);
  if (draft.message.trim()) parts.push(draft.message.trim());
  return parts.join('\n\n').slice(0, FEEDBACK_MAX_MESSAGE);
}

function nextAfterCategory(
  category: FeedbackCategory,
  hasContext: boolean,
): Exclude<FeedbackStep, 'closed' | 'submitting'> {
  if (hasContext) return 'context';
  if (category === 'general') return 'rating';
  if (category === 'question') return 'details';
  return 'topic';
}

function nextAfterContext(category: FeedbackCategory): Exclude<FeedbackStep, 'closed' | 'submitting'> {
  if (category === 'general') return 'rating';
  if (category === 'question') return 'details';
  return 'topic';
}

function nextAfterDetails(category: FeedbackCategory): Exclude<FeedbackStep, 'closed' | 'submitting'> {
  if (category === 'confusing') return 'clarify';
  if (category === 'problem') return 'blocker';
  return 'follow_up';
}

export function useFeedback() {
  const { user } = useAuth();
  const { pathname, pageUrl, context } = useFeedbackContext();
  const honeypotRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<FeedbackDraft>(() => emptyFeedbackDraft(pathname));
  const [error, setError] = useState('');
  const restored = useRef(false);

  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    const saved = readFeedbackDraft();
    if (saved) setDraft(saved);
  }, []);

  useEffect(() => {
    if (!open) return;
    if (draft.step === 'success') {
      clearFeedbackDraft();
      return;
    }
    writeFeedbackDraft({ ...draft, pagePath: pathname });
  }, [draft, open, pathname]);

  const update = useCallback((patch: Partial<FeedbackDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
  }, []);

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
        const next = { ...current, pagePath: pathname };
        if (options?.category) next.category = options.category;
        if (options?.rating != null) next.rating = options.rating;
        if (options?.step) next.step = options.step;
        else if (current.step === 'success' || current.step === 'error') next.step = 'welcome';
        else if (!current.category) next.step = 'welcome';
        return next;
      });
      focusPanel();
    },
    [focusPanel, pathname],
  );

  const closePanel = useCallback(() => {
    setOpen(false);
    focusLauncher();
  }, [focusLauncher]);

  const resetAndClose = useCallback(() => {
    clearFeedbackDraft();
    setDraft(emptyFeedbackDraft(pathname));
    setError('');
    setOpen(false);
    focusLauncher();
  }, [focusLauncher, pathname]);

  const selectCategory = useCallback(
    (category: FeedbackCategory) => {
      update({
        category,
        subcategory: null,
        step: nextAfterCategory(category, Boolean(context)),
      });
    },
    [context, update],
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
      update({ contextAnswer: composed, step: nextAfterContext(draft.category) });
    },
    [context, draft.category, draft.contextAnswer, draft.contextFollowUpId, update],
  );

  const selectTopic = useCallback((subcategory: string) => {
    update({ subcategory, step: 'details' });
  }, [update]);

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
    update({ step: nextAfterDetails(draft.category) });
  }, [draft.category, draft.message, draft.rating, update]);

  const goBack = useCallback(() => {
    setError('');
    setDraft((current) => {
      const category = current.category;
      if (current.step === 'email') return { ...current, step: 'follow_up' };
      if (current.step === 'follow_up') {
        if (category === 'confusing') return { ...current, step: 'clarify' };
        if (category === 'problem') return { ...current, step: 'blocker' };
        return { ...current, step: 'details' };
      }
      if (current.step === 'clarify' || current.step === 'blocker') return { ...current, step: 'details' };
      if (current.step === 'details') {
        if (category === 'question') return { ...current, step: context ? 'context' : 'welcome' };
        if (category === 'general') return { ...current, step: 'rating' };
        return { ...current, step: 'topic' };
      }
      if (current.step === 'rating') return { ...current, step: context ? 'context' : 'welcome' };
      if (current.step === 'topic') return { ...current, step: context ? 'context' : 'welcome' };
      if (current.step === 'context' && current.contextFollowUpId) {
        return { ...current, contextFollowUpId: null, step: 'context' };
      }
      if (current.step === 'context') return { ...current, step: 'welcome' };
      if (current.step === 'error') return { ...current, step: 'follow_up' };
      return current;
    });
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
      update({ ...overrides, step: 'details' });
      return;
    }
    if (next.wantFollowUp && !isValidFeedbackEmail(next.email)) {
      setError('Enter a valid email, like you@example.com.');
      update({ ...overrides, step: 'email' });
      return;
    }
    setError('');
    update({ ...overrides, step: 'submitting' });
    try {
      await submitFeedback(payload);
      clearFeedbackDraft();
      update({ ...overrides, step: 'success' });
    } catch (err) {
      const detail = err instanceof ApiError ? err.details?.find((item) => item.path === 'message')?.message : null;
      setError(detail || (err instanceof Error ? err.message : 'Something went wrong while sending your feedback.'));
      update({ ...overrides, step: 'error' });
    }
  }, [buildPayload, draft, update]);

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
      });
    },
    [draft.email, submit, update, user?.email],
  );

  const startOver = useCallback(() => {
    clearFeedbackDraft();
    setError('');
    setDraft(emptyFeedbackDraft(pathname));
  }, [pathname]);

  const canSendDetails = useMemo(() => {
    if (draft.category === 'general') return isNonEmptyFeedback(draft.message) || draft.rating != null;
    return isNonEmptyFeedback(draft.message);
  }, [draft.category, draft.message, draft.rating]);

  const question = useMemo(() => {
    if (draft.step === 'context') {
      const follow = draft.contextFollowUpId ? context?.followUp?.[draft.contextFollowUpId] : null;
      return follow?.question ?? context?.question ?? '';
    }
    if (draft.step === 'topic' && draft.category) return TOPIC_QUESTIONS[draft.category] ?? '';
    if (draft.step === 'details' && draft.category) return DETAIL_COPY[draft.category].question;
    if (draft.step === 'clarify') return 'What would have made this clearer?';
    if (draft.step === 'blocker') return 'Did this stop you from completing what you were trying to do?';
    if (draft.step === 'rating') return 'How has your experience with AI Trainers been so far?';
    if (draft.step === 'follow_up') return 'Would you like us to follow up?';
    return '';
  }, [context?.question, draft.category, draft.step]);

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
    draft,
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
    setRating: (rating: number) => update({ rating, step: 'details' }),
    setBlocker: (blocker: boolean) => update({ blocker, step: 'follow_up' }),
    skipClarify: () => update({ step: 'follow_up' }),
    submit,
    submitRatingOnly,
    startOver,
    retry: () => {
      setError('');
      update({ step: 'follow_up' });
    },
    keepMessage: () => {
      setError('');
      update({ step: 'details' });
    },
  };
}

export type FeedbackController = ReturnType<typeof useFeedback>;
