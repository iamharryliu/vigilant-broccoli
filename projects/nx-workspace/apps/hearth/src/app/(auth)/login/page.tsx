'use client';

import { supabase } from '../../../../libs/supabase';
import { ROUTES } from '../../../lib/routes';
import { GoogleSignInPage } from '@vigilant-broccoli/react-lib';

const APP_NAME = 'Hearth';
const GOOGLE_TASKS_SCOPE = 'https://www.googleapis.com/auth/tasks';

export default function LoginPage() {
  const handleGoogleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${ROUTES.AUTH_CALLBACK}`,
        scopes: GOOGLE_TASKS_SCOPE,
      },
    });
  };

  return <GoogleSignInPage appName={APP_NAME} onSignIn={handleGoogleSignIn} />;
}
