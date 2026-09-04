import type { Metadata } from 'next';
import { Suspense } from 'react';
import AuthShell from '../components/AuthShell';
import LoginForm from '../components/LoginForm';

export const metadata: Metadata = {
  title: 'Create account | AI Trainers',
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create your AI Trainers account"
      copy="Save opportunities, unlock profile matches, and keep your application in one place."
    >
      <h2>Create account</h2>
      <Suspense fallback={<p>Loading…</p>}>
        <LoginForm mode="register" />
      </Suspense>
    </AuthShell>
  );
}
