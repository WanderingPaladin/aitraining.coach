'use client';

import { AuthProvider } from './AuthProvider';
import FeedbackWidget from './feedback/FeedbackWidget';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <FeedbackWidget />
    </AuthProvider>
  );
}
