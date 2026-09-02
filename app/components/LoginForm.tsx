'use client';

import { useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ApiError } from '../../lib/api';
import { useAuth } from '../components/AuthProvider';

function safeNext(value: string | null): string {
  if (value && value.startsWith('/') && !value.startsWith('//')) {
    return value;
  }
  return '/profile';
}

export default function LoginForm({
  mode = 'login',
}: {
  mode?: 'login' | 'register' | 'forgot';
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const next = safeNext(searchParams.get('next'));

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setNotice('');
    setBusy(true);
    try {
      if (mode === 'forgot') {
        const { forgotPassword } = await import('../../lib/api');
        await forgotPassword(email);
        setNotice('If an account exists for that email, we sent a reset link.');
        return;
      }
      if (mode === 'register') {
        await register({ email, password });
        router.push(next);
        return;
      }
      await login({ email, password, remember });
      router.push(next);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="apply-form auth-form" onSubmit={(event) => void onSubmit(event)}>
      {error ? <p className="apply-field-error">{error}</p> : null}
      {notice ? <p className="auth-notice">{notice}</p> : null}
      <label>
        Email
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>
      {mode !== 'forgot' ? (
        <label>
          Password
          <input
            type="password"
            autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
      ) : null}
      {mode === 'login' ? (
        <div className="auth-row">
          <label className="apply-eligibility-label">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
            />
            <span className="apply-eligibility-copy">Remember me</span>
          </label>
          <a href="/forgot-password">Forgot password?</a>
        </div>
      ) : null}
      <button className="primary-button apply-submit" type="submit" disabled={busy}>
        {mode === 'register' ? 'Create account' : mode === 'forgot' ? 'Send reset link' : 'Sign In'}
      </button>
      {mode === 'login' ? (
        <p className="auth-switch">
          New to AI Trainers? <a href={`/register?next=${encodeURIComponent(next)}`}>Create your account</a>
        </p>
      ) : null}
      {mode === 'register' ? (
        <p className="auth-switch">
          Already have an account? <a href={`/login?next=${encodeURIComponent(next)}`}>Sign in</a>
        </p>
      ) : null}
      {mode === 'forgot' ? (
        <p className="auth-switch">
          Remembered it? <a href="/login">Sign in</a>
        </p>
      ) : null}
    </form>
  );
}
