'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ApiError, verifyAccountEmail } from '../../lib/api';
import { useAuth } from './AuthProvider';

export default function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const { refresh } = useAuth();
  const [message, setMessage] = useState(
    token ? 'Confirming your email…' : '',
  );
  const [error, setError] = useState(token ? '' : 'This verification link is missing a token.');

  useEffect(() => {
    if (!token) {
      return;
    }
    let cancelled = false;
    void verifyAccountEmail(token)
      .then(async () => {
        await refresh();
        if (!cancelled) {
          setMessage('Email verified. Your existing application, if any, is now linked to this account.');
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setMessage('');
        setError(err instanceof ApiError ? err.message : 'This verification link is invalid or has expired.');
      });
    return () => {
      cancelled = true;
    };
  }, [token, refresh]);

  return (
    <div>
      {error ? <p className="apply-field-error">{error}</p> : <p className="auth-notice">{message}</p>}
      <p className="auth-switch">
        <a href="/profile">Go to your profile</a>
      </p>
    </div>
  );
}
