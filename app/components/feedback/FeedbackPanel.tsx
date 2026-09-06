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

export default function FeedbackPanel({
  controller,
}: {
  controller: FeedbackController;
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
    goBack,
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

  const showBack = !['welcome', 'success', 'submitting'].includes(draft.step);
  const details = draft.category ? DETAIL_COPY[draft.category] : null;
  const topics = draft.category ? TOPIC_OPTIONS[draft.category] : null;
  const emailStep = draft.step === 'email';
  const contextFollowUp = draft.contextFollowUpId ? context?.followUp?.[draft.contextFollowUpId] : null;
  const contextOptions = contextFollowUp?.options ?? context?.options ?? [];
  const contextQuestion = contextFollowUp?.question ?? context?.question;

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
        onBack={goBack}
        onMinimize={closePanel}
        onClose={closePanel}
      />
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
        {draft.step === 'welcome' ? <FeedbackWelcome onSelect={selectCategory} /> : null}

        {draft.step === 'context' && context ? (
          <>
            <FeedbackMessage>{contextQuestion}</FeedbackMessage>
            <FeedbackChips
              options={contextOptions}
              selected={contextOptions.find((option) => option.label === draft.contextAnswer)?.id ?? draft.contextAnswer}
              onSelect={(id) => selectContext(contextOptions.find((option) => option.id === id)?.label ?? id)}
            />
          </>
        ) : null}

        {draft.step === 'topic' && topics ? (
          <>
            <FeedbackMessage>{question}</FeedbackMessage>
            <FeedbackChips options={topics} selected={draft.subcategory} onSelect={selectTopic} />
          </>
        ) : null}

        {draft.step === 'rating' ? (
          <>
            <FeedbackMessage>{question}</FeedbackMessage>
            <FeedbackRating value={draft.rating} onSelect={setRating} />
          </>
        ) : null}

        {draft.step === 'details' && details ? (
          <FeedbackTextarea
            id="feedback-details"
            label={details.question}
            placeholder={details.placeholder}
            value={draft.message}
            error={error}
            onChange={setMessage}
          />
        ) : null}

        {draft.step === 'clarify' ? (
          <FeedbackTextarea
            id="feedback-clarify"
            label="What would have made this clearer?"
            placeholder="What could we explain better?"
            value={draft.clarify}
            onChange={setClarify}
          />
        ) : null}

        {draft.step === 'blocker' ? (
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

        {draft.step === 'follow_up' || emailStep ? (
          <FeedbackFollowUp
            wantFollowUp={draft.wantFollowUp}
            email={draft.email}
            error={emailStep ? error : undefined}
            onChoose={chooseFollowUp}
            onEmail={setEmail}
          />
        ) : null}

        {draft.step === 'submitting' ? <p className="feedback-status">Sending your feedback…</p> : null}

        {draft.step === 'success' ? (
          <FeedbackSuccess
            questionHint={draft.category === 'question'}
            onDone={resetAndClose}
            onMore={startOver}
          />
        ) : null}

        {draft.step === 'error' ? <FeedbackError onRetry={retry} onKeep={keepMessage} /> : null}
      </div>

      {draft.step === 'details' || draft.step === 'clarify' || emailStep ? (
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
    </section>
  );
}
