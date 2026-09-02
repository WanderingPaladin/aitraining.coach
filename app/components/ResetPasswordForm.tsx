'use client';

import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { ApiError, resetPassword } from '../../lib/api';

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await resetPassword({ token, password });
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'This reset link is invalid or has expired.');
    } finally {
      setBusy(false);
    }
  }

  if (!token) {
    return <p className="apply-field-error">This reset link is missing a token.</p>;
  }

  if (done) {
    return (
      <p className="auth-notice">
        Password updated. <a href="/login">Sign in</a> with your new password.
      </p>
    );
  }

  return (
    <form className="apply-form auth-form" onSubmit={(event) => void onSubmit(event)}>
      {error ? <p className="apply-field-error">{error}</p> : null}
      <label>
        New password
        <input
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>
      <button className="primary-button apply-submit" type="submit" disabled={busy}>
        Update password
      </button>
    </form>
  );
}
