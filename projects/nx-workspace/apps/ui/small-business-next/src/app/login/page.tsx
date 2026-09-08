'use client';

import { GoogleSignInPage } from '@vigilant-broccoli/react-lib';
import { supabase } from '../../../libs/supabase';
import { APP_NAME, PAGE_TITLE } from '../app.const';
import { usePageTitle } from '../use-page-title';

const APP_TAGLINE = 'Sign in to continue';

export default function LoginPage() {
  usePageTitle(PAGE_TITLE.LOGIN);
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
