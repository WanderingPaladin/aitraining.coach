import { CircleQuestionMark, Lightbulb, MessageCircle, MessagesSquare, TriangleAlert } from 'lucide-react';
import type { FeedbackCategory } from '../../../lib/feedback-types';
import FeedbackMessage from './FeedbackMessage';
import FeedbackOption from './FeedbackOption';

const options: Array<{
  id: FeedbackCategory;
  label: string;
  icon: typeof CircleQuestionMark;
}> = [
  { id: 'confusing', label: 'Something was confusing', icon: CircleQuestionMark },
  { id: 'improvement', label: 'Suggest an improvement', icon: Lightbulb },
  { id: 'problem', label: 'Report a problem', icon: TriangleAlert },
  { id: 'general', label: 'Share general feedback', icon: MessageCircle },
  { id: 'question', label: 'Ask a quick question', icon: MessagesSquare },
];

export default function FeedbackWelcome({ onSelect }: { onSelect: (category: FeedbackCategory) => void }) {
  return (
    <div className="feedback-welcome">
      <FeedbackMessage>
        Hey! We’re improving AI Trainers and would love your feedback. What would you like to share?
      </FeedbackMessage>
      <div className="feedback-option-list">
        {options.map((option) => (
          <FeedbackOption
            key={option.id}
            icon={option.icon}
            label={option.label}
            onClick={() => onSelect(option.id)}
          />
        ))}
      </div>
    </div>
  );
}
