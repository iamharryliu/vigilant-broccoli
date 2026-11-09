'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../../libs/supabase';
import { ROUTES } from '../../../lib/routes';
import {
  buildAuthCallbackUrl,
  getNextFromSearch,
  storePendingNext,
  withNextParam,
} from '../../../lib/auth-redirect';
import { PAGE_TITLES, usePageTitle } from '../../../lib/page-title';

export default function SignUpPage() {
  usePageTitle(PAGE_TITLES.SIGNUP);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [next, setNext] = useState<string | null>(null);

  useEffect(() => {
    setNext(getNextFromSearch(window.location.search));
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    storePendingNext(next);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: buildAuthCallbackUrl(next),
      },
    });

    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    setMessage('Check your email to confirm your account.');
  };

  const handleGoogleSignIn = async () => {
    storePendingNext(next);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: buildAuthCallbackUrl(next),
        scopes: 'https://www.googleapis.com/auth/tasks',
      },
    });
  };

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-bold">Create account</h1>
        <form onSubmit={handleSignUp} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full rounded border px-3 py-2"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full rounded border px-3 py-2"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          {message && <p className="text-sm text-green-600">{message}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        <button
          onClick={handleGoogleSignIn}
          className="w-full rounded border py-2 hover:bg-gray-50"
        >
          Sign up with Google
        </button>
        <p className="text-center text-sm">
          Already have an account?{' '}
          <a
            href={withNextParam(ROUTES.LOGIN, next)}
            className="text-blue-600 hover:underline"
          >
            Sign in
          </a>
        </p>
      </div>
    </main>
  );
}
