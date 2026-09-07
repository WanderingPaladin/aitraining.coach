import { MessageCircle, MessageSquarePlus } from 'lucide-react';
import FeedbackMessage from './FeedbackMessage';
import FeedbackOption from './FeedbackOption';

export default function AssistantHome({
  onChat,
  onFeedback,
  hasConversation,
}: {
  onChat: () => void;
  onFeedback: () => void;
  hasConversation?: boolean;
}) {
  return (
    <div className="feedback-welcome">
      <FeedbackMessage>How can we help?</FeedbackMessage>
      <div className="feedback-option-list">
        {hasConversation ? (
          <FeedbackOption
            icon={MessageCircle}
            label="Continue Chat"
            description="Pick up your recent conversation with AI Trainers."
            primary
            onClick={onChat}
          />
        ) : (
          <FeedbackOption
            icon={MessageCircle}
            label="Chat with Team"
            description="Ask about getting started, opportunities, your application, booking, or profile."
            primary
            onClick={onChat}
          />
        )}
        <FeedbackOption
          icon={MessageSquarePlus}
          label="Give Feedback"
          description="Tell us what's confusing or what you'd like us to improve."
          onClick={onFeedback}
        />
      </div>
    </div>
  );
}
