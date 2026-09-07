import { MessageCircle, MessageSquarePlus } from 'lucide-react';
import FeedbackMessage from './FeedbackMessage';
import FeedbackOption from './FeedbackOption';

export default function AssistantHome({
  onChat,
  onFeedback,
}: {
  onChat: () => void;
  onFeedback: () => void;
}) {
  return (
    <div className="feedback-welcome">
      <FeedbackMessage>Help is just a message away. How can we help?</FeedbackMessage>
      <div className="feedback-option-list">
        <FeedbackOption
          icon={MessageCircle}
          label="Chat with Team"
          description="Ask about getting started, opportunities, your application, booking, or profile."
          primary
          onClick={onChat}
        />
        <FeedbackOption
          icon={MessageSquarePlus}
          label="Give Feedback"
          description="Tell us what we could improve."
          onClick={onFeedback}
        />
      </div>
    </div>
  );
}
