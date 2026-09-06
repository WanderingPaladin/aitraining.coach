import { ChevronLeft, Minus, X } from 'lucide-react';
import BrandMark from './BrandMark';

export default function FeedbackHeader({
  showBack,
  onBack,
  onMinimize,
  onClose,
}: {
  showBack: boolean;
  onBack: () => void;
  onMinimize: () => void;
  onClose: () => void;
}) {
  return (
    <header className="feedback-header">
      <div className="feedback-header-id">
        {showBack ? (
          <button type="button" className="feedback-icon-btn" aria-label="Back" onClick={onBack}>
            <ChevronLeft size={18} strokeWidth={2} />
          </button>
        ) : (
          <BrandMark className="brand-mark feedback-mark" />
        )}
        <div>
          <p className="feedback-title" id="feedback-assistant-title">AI Trainers Assistant</p>
          <p className="feedback-subtitle">Help us improve your experience</p>
        </div>
      </div>
      <div className="feedback-header-actions">
        <button type="button" className="feedback-icon-btn" aria-label="Minimize" onClick={onMinimize}>
          <Minus size={16} strokeWidth={2} />
        </button>
        <button type="button" className="feedback-icon-btn" aria-label="Close feedback assistant" onClick={onClose}>
          <X size={16} strokeWidth={2} />
        </button>
      </div>
    </header>
  );
}
