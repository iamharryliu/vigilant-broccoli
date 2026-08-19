'use client';

import { GoogleSignInPage } from '@vigilant-broccoli/react-lib';
import { supabase } from '../../../libs/supabase';

const APP_NAME = 'VB Manager';
const APP_TAGLINE = 'Sign in to manage your calendar';
const GOOGLE_CALENDAR_TASKS_SCOPES =
  'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/tasks';

export default function LoginPage() {
  const handleGoogleSignIn = () => {
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: GOOGLE_CALENDAR_TASKS_SCOPES,
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
