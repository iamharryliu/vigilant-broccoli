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
import { GoogleSignInPage } from '@vigilant-broccoli/react-lib-auth';
import { APP_NAME, PAGE_TITLES, usePageTitle } from '../../../lib/page-title';

const GOOGLE_TASKS_SCOPE = 'https://www.googleapis.com/auth/tasks';

export default function LoginPage() {
  usePageTitle(PAGE_TITLES.LOGIN);
  // Read after mount: useSearchParams would force a Suspense boundary.
  const [next, setNext] = useState<string | null>(null);

  useEffect(() => {
    setNext(getNextFromSearch(window.location.search));
  }, []);

  const handleGoogleSignIn = async () => {
    storePendingNext(next);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: buildAuthCallbackUrl(next),
        scopes: GOOGLE_TASKS_SCOPE,
      },
    });
  };

  return (
    <GoogleSignInPage
      appName={APP_NAME}
      tagline={
        <a
          href={withNextParam(ROUTES.SIGNUP, next)}
          className="hover:underline"
        >
          No Google account? Sign up with email
        </a>
      }
      onSignIn={handleGoogleSignIn}
    />
  );
}
