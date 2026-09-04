import type { Metadata } from 'next';
import { Suspense } from 'react';
import AuthShell from '../components/AuthShell';
import LoginForm from '../components/LoginForm';

export const metadata: Metadata = {
  title: 'Reset password | AI Trainers',
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      copy="Enter the email on your account and we’ll send a reset link if it matches."
    >
      <h2>Forgot password</h2>
      <Suspense fallback={<p>Loading…</p>}>
        <LoginForm mode="forgot" />
      </Suspense>
    </AuthShell>
  );
}
