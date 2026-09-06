'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  FEEDBACK_PROMPT_EVENT,
  consumePendingFeedbackPrompt,
  markPromptSeen,
  requestFeedbackPrompt,
  wasPromptSeen,
} from '../../../lib/feedback-storage';
import type { FeedbackPromptKind } from '../../../lib/feedback-types';
import { useFeedback } from '../../hooks/useFeedback';
import FeedbackLauncher from './FeedbackLauncher';
import FeedbackPanel from './FeedbackPanel';
import FeedbackPrompt from './FeedbackPrompt';

const PROMPT_COPY: Record<FeedbackPromptKind, string> = {
  application: 'How was the application experience?',
  booking: 'How easy was it to schedule your call?',
  opportunities: 'Finding what you need?',
  profile: 'Was your profile experience clear?',
};

export default function FeedbackWidget() {
  const controller = useFeedback();
  const [prompt, setPrompt] = useState<FeedbackPromptKind | null>(null);

  const dismissPrompt = useCallback((kind: FeedbackPromptKind) => {
    markPromptSeen(kind);
    setPrompt(null);
  }, []);

  useEffect(() => {
    function onPrompt(event: Event) {
      const detail = (event as CustomEvent<{ kind?: FeedbackPromptKind }>).detail;
      const kind = detail?.kind;
      if (!kind || controller.open || wasPromptSeen(kind)) return;
      window.setTimeout(() => {
        if (document.querySelector('form:focus-within')) return;
        setPrompt((current) => current ?? kind);
      }, 1600);
    }
    window.addEventListener(FEEDBACK_PROMPT_EVENT, onPrompt);
    return () => window.removeEventListener(FEEDBACK_PROMPT_EVENT, onPrompt);
  }, [controller.open]);

  useEffect(() => {
    if (controller.open) setPrompt(null);
  }, [controller.open]);

  useEffect(() => {
    const pending = consumePendingFeedbackPrompt();
    if (pending) requestFeedbackPrompt(pending);
  }, [controller.pathname]);

  async function handlePromptRating(rating: number) {
    if (!prompt) return;
    const kind = prompt;
    dismissPrompt(kind);
    try {
      await controller.submitRatingOnly(rating);
    } catch {
      // still let them add comments in the assistant
    }
    controller.openPanel({ category: 'general', rating, step: 'details' });
  }

  return (
    <div className="feedback-root">
      {prompt && !controller.open ? (
        <FeedbackPrompt
          question={PROMPT_COPY[prompt]}
          onRate={(rating) => void handlePromptRating(rating)}
          onDismiss={() => dismissPrompt(prompt)}
        />
      ) : null}
      <FeedbackPanel controller={controller} />
      <FeedbackLauncher
        open={controller.open}
        buttonRef={controller.launcherRef}
        onToggle={() => (controller.open ? controller.closePanel() : controller.openPanel())}
      />
    </div>
  );
}
