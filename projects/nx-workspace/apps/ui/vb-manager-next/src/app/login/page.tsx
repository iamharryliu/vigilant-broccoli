'use client';

import { GoogleSigninButton } from '@vigilant-broccoli/react-lib';
import { signInWithGoogle } from '../../../libs/auth';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-bold text-center">Sign in</h1>
        <GoogleSigninButton onClick={signInWithGoogle} />
      </div>
    </main>
  );
}
