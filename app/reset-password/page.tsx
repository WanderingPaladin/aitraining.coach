import type { Metadata } from 'next';
import { Suspense } from 'react';
import AuthShell from '../components/AuthShell';
import ResetPasswordForm from '../components/ResetPasswordForm';

export const metadata: Metadata = {
  title: 'Choose a new password | AI Trainers',
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Choose a new password"
      copy="Use at least 8 characters. You’ll sign in again after the reset."
    >
      <h2>New password</h2>
      <Suspense fallback={<p>Loading…</p>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
