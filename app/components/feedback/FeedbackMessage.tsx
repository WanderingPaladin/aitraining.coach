import type { ReactNode } from 'react';

export default function FeedbackMessage({ children }: { children: ReactNode }) {
  return <p className="feedback-message">{children}</p>;
}
