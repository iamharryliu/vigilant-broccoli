'use client';
import { authClient } from '../../../libs/auth-client';

export default function SignInPage() {
  const handleGoogleSignIn = async () => {
    await authClient.signIn.social({
      provider: 'google',
    });
  };

  return (
    <main>
      <button onClick={handleGoogleSignIn}>Sign in with Google</button>
    </main>
  );
}
