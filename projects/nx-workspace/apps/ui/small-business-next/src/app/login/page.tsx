'use client';

import { GoogleSignInPage } from '@vigilant-broccoli/react-lib';
import { supabase } from '../../../libs/supabase';

const APP_NAME = 'Small Business';
const APP_TAGLINE = 'Sign in to continue';

export default function LoginPage() {
  const handleGoogleSignIn = () => {
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <GoogleSignInPage
      appName={APP_NAME}
      tagline={APP_TAGLINE}
      onSignIn={handleGoogleSignIn}
    />
  );
}
