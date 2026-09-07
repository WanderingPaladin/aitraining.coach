import { ChevronLeft, Minus, X } from 'lucide-react';
import { pressProps } from '../../../lib/press';
import BrandMark from './BrandMark';

export default function FeedbackHeader({
  showBack,
  title = 'AI Trainers Assistant',
  subtitle = 'Help us improve your experience',
  presence,
  onBack,
  onMinimize,
  onClose,
}: {
  showBack: boolean;
  title?: string;
  subtitle?: string;
  presence?: 'online' | 'offline' | null;
  onBack: () => void;
  onMinimize: () => void;
  onClose: () => void;
}) {
  return (
    <header className="feedback-header">
      <div className="feedback-header-id">
        {showBack ? (
          <button type="button" className="feedback-back-btn" aria-label="Back" {...pressProps(onBack)}>
            <ChevronLeft size={18} strokeWidth={2} aria-hidden="true" />
            Back
          </button>
        ) : (
          <BrandMark className="brand-mark feedback-mark" />
        )}
        <div>
          <p className="feedback-title" id="feedback-assistant-title">{title}</p>
          <p className="feedback-subtitle">
            {presence ? (
              <span className={`chat-presence is-${presence}`} aria-live="polite">
                <i aria-hidden="true" />
                {presence === 'online' ? 'Online' : 'Offline'}
              </span>
            ) : (
              subtitle
            )}
          </p>
        </div>
      </div>
      <div className="feedback-header-actions">
        <button type="button" className="feedback-icon-btn" aria-label="Minimize" {...pressProps(onMinimize)}>
          <Minus size={16} strokeWidth={2} />
        </button>
        <button type="button" className="feedback-icon-btn" aria-label="Close assistant" {...pressProps(onClose)}>
          <X size={16} strokeWidth={2} />
        </button>
      </div>
    </header>
  );
}