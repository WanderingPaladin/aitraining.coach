'use client';

import { useCallback, useEffect, useState } from 'react';
import { isValidFeedbackEmail } from '../../../lib/feedback-validation';
import {
  FEEDBACK_PROMPT_EVENT,
  consumePendingFeedbackPrompt,
  markPromptSeen,
  requestFeedbackPrompt,
  wasPromptSeen,
} from '../../../lib/feedback-storage';
import type { FeedbackCategory, FeedbackPromptKind } from '../../../lib/feedback-types';
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
  const [entryPoint, setEntryPoint] = useState<'home' | 'chat'>('home');
  const [prompt, setPrompt] = useState<FeedbackPromptKind | null>(null);
  const [notifyDismissed, setNotifyDismissed] = useState(false);

  const dismissPrompt = useCallback((kind: FeedbackPromptKind) => {
    markPromptSeen(kind);
    setPrompt(null);
  }, []);

  const openHome = useCallback(() => {
    setView('home');
    setEntryPoint('home');
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

  const openFeedback = useCallback(
    (from: 'home' | 'chat' = 'home', category?: FeedbackCategory) => {
      setEntryPoint(from);
      setNotifyDismissed(false);
      controller.openFeedback({ category });
      setView('feedback');
    },
    [controller],
  );

  const handleBack = useCallback(() => {
    if (view === 'chat') {
      setView('home');
      return;
    }
    if (view === 'feedback') {
      const exited = controller.goBack();
      if (exited) {
        setView(entryPoint === 'chat' ? 'chat' : 'home');
      }
    }
  }, [controller, entryPoint, view]);

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
      if (detail.view === 'feedback') openFeedback('home');
      else if (detail.view === 'home') openHome();
      else openChat(detail);
    }
    window.addEventListener(ASSISTANT_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(ASSISTANT_OPEN_EVENT, onOpen);
  }, [openChat, openFeedback, openHome]);

  useEffect(() => {
    if (entryPoint !== 'chat' || controller.draft.step !== 'success') return;
    void chat.openChat().then(() => {
      setView('chat');
      if (!controller.userEmail && !chat.conversation?.contactEmail) {
        chat.setAskEmail(true);
      }
    });
  }, [chat.openChat, chat.setAskEmail, chat.conversation?.contactEmail, controller.draft.step, controller.userEmail, entryPoint]);

  async function handlePromptRating(rating: number) {
    if (!prompt) return;
    const kind = prompt;
    dismissPrompt(kind);
    try {
      await controller.submitRatingOnly(rating);
    } catch {
      // still let them add comments in the assistant
    }
    setEntryPoint('home');
    setView('feedback');
    controller.openPanel({ category: 'general', rating, step: 'details' });
  }

  const askNotify =
    view === 'feedback' &&
    controller.draft.step === 'success' &&
    !notifyDismissed &&
    !controller.userEmail &&
    !controller.submission?.contactEmail;

  async function handleNotify() {
    const conversationId = controller.submission?.conversationId ?? chat.conversation?.id;
    if (!conversationId || !isValidFeedbackEmail(controller.draft.email)) return;
    try {
      await chat.saveEmailFor(conversationId, controller.draft.email);
      setNotifyDismissed(true);
    } catch {
      // keep the form visible
    }
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
        onFeedback={(kind) => openFeedback(view === 'chat' ? 'chat' : 'home', kind)}
        onHome={() => setView('home')}
        onBack={handleBack}
        onContinueChat={() => openChat()}
        askNotify={askNotify}
        onNotify={() => void handleNotify()}
        onSkipNotify={() => setNotifyDismissed(true)}
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
