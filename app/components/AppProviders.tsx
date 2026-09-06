'use client';

import { AuthProvider } from './AuthProvider';
import FeedbackWidget from './feedback/FeedbackWidget';
import JourneyTracker from './JourneyTracker';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <JourneyTracker />
      {children}
      <FeedbackWidget />
    </AuthProvider>
  );
}
