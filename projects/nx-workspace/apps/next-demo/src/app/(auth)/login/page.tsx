'use client';

import { supabase } from '../../../../libs/supabase';
import { ROUTES } from '../../../lib/routes';

export default function LoginPage() {
  const handleGoogleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${ROUTES.AUTH_CALLBACK}`,
      },
    });
  };

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-bold">Sign in</h1>
        <button
          onClick={handleGoogleSignIn}
          className="w-full rounded border py-2 hover:bg-gray-50"
        >
          Sign in with Google
        </button>
      </div>
    </main>
  );
}
