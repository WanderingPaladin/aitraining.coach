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
import { ASSISTANT_OPEN_EVENT, type AssistantOpenDetail, type AssistantView } from '../../../lib/assistant';
import { useFeedback } from '../../hooks/useFeedback';
import { useChat } from '../../hooks/useChat';
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
  const chat = useChat();
  const [view, setView] = useState<AssistantView>('home');
  const [prompt, setPrompt] = useState<FeedbackPromptKind | null>(null);

  const dismissPrompt = useCallback((kind: FeedbackPromptKind) => {
    markPromptSeen(kind);
    setPrompt(null);
  }, []);

  const openHome = useCallback(() => {
    setView('home');
    controller.openPanel();
  }, [controller]);

  const openChat = useCallback(
    (detail?: AssistantOpenDetail) => {
      setView('chat');
      controller.openPanel();
      void chat.openChat({
        topic: detail?.topic,
        opportunityId: detail?.opportunityId,
        opportunityTitle: detail?.opportunityTitle,
        opportunityPlatform: detail?.opportunityPlatform,
        contextType: detail?.contextType,
      });
    },
    [chat, controller],
  );

  const openFeedback = useCallback(() => {
    setView('feedback');
    controller.openPanel();
  }, [controller]);

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
    chat.setActive(controller.open && view === 'chat');
  }, [chat.setActive, controller.open, view]);

  useEffect(() => {
    const pending = consumePendingFeedbackPrompt();
    if (pending) requestFeedbackPrompt(pending);
  }, [controller.pathname]);

  useEffect(() => {
    function onOpen(event: Event) {
      const detail = (event as CustomEvent<AssistantOpenDetail>).detail ?? {};
      if (detail.view === 'feedback') openFeedback();
      else if (detail.view === 'home') openHome();
      else openChat(detail);
    }
    window.addEventListener(ASSISTANT_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(ASSISTANT_OPEN_EVENT, onOpen);
  }, [openChat, openFeedback, openHome]);

  async function handlePromptRating(rating: number) {
    if (!prompt) return;
    const kind = prompt;
    dismissPrompt(kind);
    try {
      await controller.submitRatingOnly(rating);
    } catch {
      // still let them add comments in the assistant
    }
    setView('feedback');
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
      <FeedbackPanel
        controller={controller}
        chat={chat}
        view={view}
        onChat={() => openChat()}
        onFeedback={openFeedback}
        onHome={() => setView('home')}
      />
      <FeedbackLauncher
        open={controller.open}
        unreadCount={chat.unreadCount}
        buttonRef={controller.launcherRef}
        onToggle={() => (controller.open ? controller.closePanel() : openHome())}
      />
    </div>
  );
}
