import type { Metadata } from 'next';
import { Suspense } from 'react';
import AuthShell from '../components/AuthShell';
import VerifyEmailClient from '../components/VerifyEmailClient';

export const metadata: Metadata = {
  title: 'Verify email | AI Trainers',
  robots: { index: false, follow: false },
};

export default function VerifyEmailPage() {
  return (
    <AuthShell
      title="Verify your email"
      copy="Confirming this address lets us safely attach an existing application to your account."
    >
      <h2>Email verification</h2>
      <Suspense fallback={<p>Loading…</p>}>
        <VerifyEmailClient />
      </Suspense>
    </AuthShell>
  );
}
