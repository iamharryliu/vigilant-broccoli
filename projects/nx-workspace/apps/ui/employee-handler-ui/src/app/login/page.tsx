'use client';

import { GoogleSignInPage } from '@vigilant-broccoli/react-lib';

import { supabase } from '../../../libs/supabase';
import { ROUTES } from '../../lib/routes';
import { useTranslation } from '../i18n';

export default function LoginPage() {
  const { t } = useTranslation();

  const handleGoogleSignIn = () => {
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${ROUTES.AUTH_CALLBACK}`,
      },
    });
  };

  return (
    <GoogleSignInPage
      appName={t('APP.LABEL')}
      tagline={t('APP.TAGLINE')}
      onSignIn={handleGoogleSignIn}
    />
  );
}
