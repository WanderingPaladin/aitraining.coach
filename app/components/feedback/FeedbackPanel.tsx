import { Send } from 'lucide-react';
import { DETAIL_COPY, TOPIC_OPTIONS } from '../../../lib/feedback-context';
import { coerceRenderableDraft } from '../../../lib/feedback-state';
import type { FeedbackCategory, FeedbackDraft, RouteContextPrompt } from '../../../lib/feedback-types';
import { isValidFeedbackEmail } from '../../../lib/feedback-validation';
import type { AssistantView } from '../../../lib/assistant';
import type { FeedbackController } from '../../hooks/useFeedback';
import type { ChatController } from '../../hooks/useChat';
import ChatThread from '../chat/ChatThread';
import AssistantErrorBoundary from './AssistantErrorBoundary';
import AssistantHome from './AssistantHome';
import FeedbackChips from './FeedbackChips';
import FeedbackError from './FeedbackError';
import FeedbackFollowUp from './FeedbackFollowUp';
import FeedbackHeader from './FeedbackHeader';
import FeedbackMessage from './FeedbackMessage';
import FeedbackRating from './FeedbackRating';
import FeedbackSuccess from './FeedbackSuccess';
import FeedbackTextarea from './FeedbackTextarea';
import FeedbackWelcome from './FeedbackWelcome';

export default function FeedbackPanel({
  controller,
  chat,
  view,
  onChat,
  onFeedback,
  onHome,
  onBack,
  onContinueChat,
  askNotify,
  onNotify,
  onSkipNotify,
}: {
  controller: FeedbackController;
  chat: ChatController;
  view: AssistantView;
  onChat: () => void;
  onFeedback: (kind?: 'problem' | 'improvement') => void;
  onHome: () => void;
  onBack: () => void;
  onContinueChat: () => void;
  askNotify: boolean;
  onNotify: () => void;
  onSkipNotify: () => void;
}) {
  const {
    open,
    draft,
    error,
    context,
    question,
    canSendDetails,
    panelRef,
    closePanel,
    selectCategory,
    selectContext,
    selectTopic,
    setMessage,
    setClarify,
    continueFromDetails,
    chooseFollowUp,
    setEmail,
    setRating,
    setBlocker,
    skipClarify,
    submit,
    startOver,
    retry,
    keepMessage,
    resetAndClose,
    honeypotRef,
  } = controller;

  const renderDraft = coerceRenderableDraft(draft, context);
  const showBack =
    view === 'chat' ||
    (view === 'feedback' && renderDraft.step !== 'success' && renderDraft.step !== 'submitting');
  const emailStep = renderDraft.step === 'email';
  const hasConversation = Boolean(chat.conversation && chat.messages.length);

  return (
    <section
      ref={panelRef}
      id="feedback-assistant-panel"
      className={open ? 'feedback-panel is-open' : 'feedback-panel'}
      role="dialog"
      aria-modal="false"
      aria-labelledby="feedback-assistant-title"
      tabIndex={-1}
      aria-hidden={!open}
      data-assistant-view={view}
      data-feedback-step={view === 'feedback' ? renderDraft.step : view}
    >
      <FeedbackHeader
        showBack={showBack}
        title={view === 'chat' ? 'AI Trainers Team' : 'AI Trainers Assistant'}
        subtitle={view === 'home' ? 'How can we help?' : 'Help us improve your experience'}
        presence={view === 'chat' ? (chat.teamOnline ? 'online' : 'offline') : null}
        onBack={onBack}
        onMinimize={closePanel}
        onClose={closePanel}
      />
      {view === 'chat' ? (
        <ChatThread chat={chat} onGiveFeedback={onFeedback} />
      ) : (
        <>
          <div className="feedback-body">
            <label className="feedback-honeypot">
              Company website
              <input
                ref={honeypotRef}
                type="text"
                name="companyWebsite"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />
            </label>
            <AssistantErrorBoundary
              onReset={view === 'feedback' ? startOver : onHome}
              onBack={onHome}
            >
              {view === 'home' ? (
                <AssistantHome onChat={onChat} onFeedback={onFeedback} hasConversation={hasConversation} />
              ) : (
                <FeedbackStepBody
                  draft={renderDraft}
                  context={context}
                  question={question}
                  error={error}
                  askNotify={askNotify}
                  onSelectCategory={selectCategory}
                  onSelectContext={selectContext}
                  onSelectTopic={selectTopic}
                  onMessage={setMessage}
                  onClarify={setClarify}
                  onRating={setRating}
                  onBlocker={setBlocker}
                  onChooseFollowUp={chooseFollowUp}
                  onEmail={setEmail}
                  onNotify={onNotify}
                  onSkipNotify={onSkipNotify}
                  onDone={resetAndClose}
                  onChat={onContinueChat}
                  onRetry={retry}
                  onKeep={keepMessage}
                />
              )}
            </AssistantErrorBoundary>
          </div>

          {view === 'feedback' && (renderDraft.step === 'details' || renderDraft.step === 'clarify' || emailStep) ? (
            <footer className="feedback-footer">
              {renderDraft.step === 'clarify' ? (
                <button type="button" className="feedback-secondary" onClick={skipClarify}>
                  Skip
                </button>
              ) : (
                <span />
              )}
              {renderDraft.step === 'details' ? (
                <button type="button" className="feedback-primary" disabled={!canSendDetails} onClick={continueFromDetails}>
                  Continue
                </button>
              ) : null}
              {renderDraft.step === 'clarify' ? (
                <button type="button" className="feedback-primary" onClick={skipClarify}>
                  Continue
                </button>
              ) : null}
              {emailStep ? (
                <button
                  type="button"
                  className="feedback-primary"
                  disabled={!isValidFeedbackEmail(renderDraft.email)}
                  onClick={() => void submit()}
                >
                  Send Feedback
                  <Send size={16} strokeWidth={2} aria-hidden="true" />
                </button>
              ) : null}
            </footer>
          ) : null}
        </>
      )}
    </section>
  );
}

function FeedbackStepBody({
  draft,
  context,
  question,
  error,
  askNotify,
  onSelectCategory,
  onSelectContext,
  onSelectTopic,
  onMessage,
  onClarify,
  onRating,
  onBlocker,
  onChooseFollowUp,
  onEmail,
  onNotify,
  onSkipNotify,
  onDone,
  onChat,
  onRetry,
  onKeep,
}: {
  draft: FeedbackDraft;
  context: RouteContextPrompt | null;
  question: string;
  error: string;
  askNotify: boolean;
  onSelectCategory: (category: FeedbackCategory) => void;
  onSelectContext: (answer: string) => void;
  onSelectTopic: (subcategory: string) => void;
  onMessage: (message: string) => void;
  onClarify: (value: string) => void;
  onRating: (rating: number) => void;
  onBlocker: (blocked: boolean) => void;
  onChooseFollowUp: (wantFollowUp: boolean) => void;
  onEmail: (email: string) => void;
  onNotify: () => void;
  onSkipNotify: () => void;
  onDone: () => void;
  onChat: () => void;
  onRetry: () => void;
  onKeep: () => void;
}) {
  const details = draft.category ? DETAIL_COPY[draft.category] : null;
  const topics = draft.category ? TOPIC_OPTIONS[draft.category] : null;
  const contextFollowUp = draft.contextFollowUpId ? context?.followUp?.[draft.contextFollowUpId] : null;
  const contextOptions = contextFollowUp?.options ?? context?.options ?? [];
  const contextQuestion = contextFollowUp?.question ?? context?.question;

  switch (draft.step) {
    case 'context':
      if (context) {
        return (
          <>
            <FeedbackMessage>{contextQuestion}</FeedbackMessage>
            <FeedbackChips
              options={contextOptions}
              selected={contextOptions.find((option) => option.label === draft.contextAnswer)?.id ?? draft.contextAnswer}
              onSelect={(id) => onSelectContext(contextOptions.find((option) => option.id === id)?.label ?? id)}
            />
          </>
        );
      }
      return <FeedbackWelcome onSelect={onSelectCategory} />;
    case 'topic':
      if (topics) {
        return (
          <>
            <FeedbackMessage>{question}</FeedbackMessage>
            <FeedbackChips options={topics} selected={draft.subcategory} onSelect={onSelectTopic} />
          </>
        );
      }
      return <FeedbackWelcome onSelect={onSelectCategory} />;
    case 'rating':
      return (
        <>
          <FeedbackMessage>{question}</FeedbackMessage>
          <FeedbackRating value={draft.rating} onSelect={onRating} />
        </>
      );
    case 'details':
      if (details) {
        return (
          <FeedbackTextarea
            id="feedback-details"
            label={details.question}
            placeholder={details.placeholder}
            value={draft.message}
            error={error}
            onChange={onMessage}
          />
        );
      }
      return <FeedbackWelcome onSelect={onSelectCategory} />;
    case 'clarify':
      return (
        <FeedbackTextarea
          id="feedback-clarify"
          label="What would have made this clearer?"
          placeholder="What could we explain better?"
          value={draft.clarify}
          onChange={onClarify}
        />
      );
    case 'blocker':
      return (
        <>
          <FeedbackMessage>{question}</FeedbackMessage>
          <FeedbackChips
            selected={draft.blocker == null ? null : draft.blocker ? 'yes' : 'no'}
            onSelect={(id) => onBlocker(id === 'yes')}
            options={[
              { id: 'yes', label: 'Yes' },
              { id: 'no', label: 'No' },
            ]}
          />
        </>
      );
    case 'follow_up':
    case 'email':
      return (
        <FeedbackFollowUp
          wantFollowUp={draft.wantFollowUp}
          email={draft.email}
          error={draft.step === 'email' ? error : undefined}
          onChoose={onChooseFollowUp}
          onEmail={onEmail}
        />
      );
    case 'submitting':
      return <p className="feedback-status">Sending your feedback…</p>;
    case 'success':
      return (
        <FeedbackSuccess
          questionHint={draft.category === 'question'}
          askNotify={askNotify}
          email={draft.email}
          emailError={error}
          onEmail={onEmail}
          onNotify={onNotify}
          onSkipNotify={onSkipNotify}
          onDone={onDone}
          onChat={onChat}
        />
      );
    case 'error':
      return <FeedbackError onRetry={onRetry} onKeep={onKeep} />;
    case 'welcome':
    default:
      return <FeedbackWelcome onSelect={onSelectCategory} />;
  }
}
