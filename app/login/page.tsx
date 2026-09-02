import type { Metadata } from 'next';
import { Suspense } from 'react';
import AuthShell from '../components/AuthShell';
import LoginForm from '../components/LoginForm';

export const metadata: Metadata = {
  title: 'Log in | AI Trainers',
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back to AI Trainers"
      copy="Sign in to save opportunities, see your profile matches, and keep your coaching journey in one place."
    >
      <h2>Sign in</h2>
      <Suspense fallback={<p>Loading…</p>}>
        <LoginForm mode="login" />
      </Suspense>
    </AuthShell>
  );
}
