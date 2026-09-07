import { Send } from 'lucide-react';
import { DETAIL_COPY, TOPIC_OPTIONS } from '../../../lib/feedback-context';
import { isValidFeedbackEmail } from '../../../lib/feedback-validation';
import type { FeedbackController } from '../../hooks/useFeedback';
import FeedbackChips from './FeedbackChips';
import FeedbackError from './FeedbackError';
import FeedbackFollowUp from './FeedbackFollowUp';
import FeedbackHeader from './FeedbackHeader';
import FeedbackMessage from './FeedbackMessage';
import FeedbackRating from './FeedbackRating';
import FeedbackSuccess from './FeedbackSuccess';
import FeedbackTextarea from './FeedbackTextarea';
import FeedbackWelcome from './FeedbackWelcome';
import AssistantHome from './AssistantHome';
import type { AssistantView } from '../../../lib/assistant';
import ChatThread from '../chat/ChatThread';
import type { ChatController } from '../../hooks/useChat';

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

  const showBack =
    view === 'chat' ||
    (view === 'feedback' && draft.step !== 'success' && draft.step !== 'submitting');
  const details = draft.category ? DETAIL_COPY[draft.category] : null;
  const topics = draft.category ? TOPIC_OPTIONS[draft.category] : null;
  const emailStep = draft.step === 'email';
  const contextFollowUp = draft.contextFollowUpId ? context?.followUp?.[draft.contextFollowUpId] : null;
  const contextOptions = contextFollowUp?.options ?? context?.options ?? [];
  const contextQuestion = contextFollowUp?.question ?? context?.question;
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
      inert={!open || undefined}
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
        {view === 'home' ? (
          <AssistantHome onChat={onChat} onFeedback={onFeedback} hasConversation={hasConversation} />
        ) : null}
        {view === 'feedback' && draft.step === 'welcome' ? <FeedbackWelcome onSelect={selectCategory} /> : null}

        {view === 'feedback' && draft.step === 'context' && context ? (
          <>
            <FeedbackMessage>{contextQuestion}</FeedbackMessage>
            <FeedbackChips
              options={contextOptions}
              selected={contextOptions.find((option) => option.label === draft.contextAnswer)?.id ?? draft.contextAnswer}
              onSelect={(id) => selectContext(contextOptions.find((option) => option.id === id)?.label ?? id)}
            />
          </>
        ) : null}

        {view === 'feedback' && draft.step === 'topic' && topics ? (
          <>
            <FeedbackMessage>{question}</FeedbackMessage>
            <FeedbackChips options={topics} selected={draft.subcategory} onSelect={selectTopic} />
          </>
        ) : null}

        {view === 'feedback' && draft.step === 'rating' ? (
          <>
            <FeedbackMessage>{question}</FeedbackMessage>
            <FeedbackRating value={draft.rating} onSelect={setRating} />
          </>
        ) : null}

        {view === 'feedback' && draft.step === 'details' && details ? (
          <FeedbackTextarea
            id="feedback-details"
            label={details.question}
            placeholder={details.placeholder}
            value={draft.message}
            error={error}
            onChange={setMessage}
          />
        ) : null}

        {view === 'feedback' && draft.step === 'clarify' ? (
          <FeedbackTextarea
            id="feedback-clarify"
            label="What would have made this clearer?"
            placeholder="What could we explain better?"
            value={draft.clarify}
            onChange={setClarify}
          />
        ) : null}

        {view === 'feedback' && draft.step === 'blocker' ? (
          <>
            <FeedbackMessage>{question}</FeedbackMessage>
            <FeedbackChips
              selected={draft.blocker == null ? null : draft.blocker ? 'yes' : 'no'}
              onSelect={(id) => setBlocker(id === 'yes')}
              options={[
                { id: 'yes', label: 'Yes' },
                { id: 'no', label: 'No' },
              ]}
            />
          </>
        ) : null}

        {view === 'feedback' && (draft.step === 'follow_up' || emailStep) ? (
          <FeedbackFollowUp
            wantFollowUp={draft.wantFollowUp}
            email={draft.email}
            error={emailStep ? error : undefined}
            onChoose={chooseFollowUp}
            onEmail={setEmail}
          />
        ) : null}

        {view === 'feedback' && draft.step === 'submitting' ? <p className="feedback-status">Sending your feedback…</p> : null}

        {view === 'feedback' && draft.step === 'success' ? (
          <FeedbackSuccess
            questionHint={draft.category === 'question'}
            askNotify={askNotify}
            email={draft.email}
            emailError={error}
            onEmail={setEmail}
            onNotify={onNotify}
            onSkipNotify={onSkipNotify}
            onDone={resetAndClose}
            onChat={onContinueChat}
          />
        ) : null}

        {view === 'feedback' && draft.step === 'error' ? <FeedbackError onRetry={retry} onKeep={keepMessage} /> : null}
      </div>

      {view === 'feedback' && (draft.step === 'details' || draft.step === 'clarify' || emailStep) ? (
        <footer className="feedback-footer">
          {draft.step === 'clarify' ? (
            <button type="button" className="feedback-secondary" onClick={skipClarify}>
              Skip
            </button>
          ) : (
            <span />
          )}
          {draft.step === 'details' ? (
            <button type="button" className="feedback-primary" disabled={!canSendDetails} onClick={continueFromDetails}>
              Continue
            </button>
          ) : null}
          {draft.step === 'clarify' ? (
            <button type="button" className="feedback-primary" onClick={skipClarify}>
              Continue
            </button>
          ) : null}
          {emailStep ? (
            <button
              type="button"
              className="feedback-primary"
              disabled={!isValidFeedbackEmail(draft.email)}
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
