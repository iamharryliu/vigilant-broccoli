'use client';

import { GoogleSignInPage } from '@vigilant-broccoli/react-lib';

import { getSupabase } from '../../../libs/supabase';
import { ROUTES } from '../../lib/routes';
import { useTranslation } from '../i18n';
import { usePageTitle } from '../use-page-title';

export default function LoginPage() {
  const { t } = useTranslation();
  usePageTitle(t('PAGE_TITLE.LOGIN'));

  const handleGoogleSignIn = async () => {
    const supabase = await getSupabase();
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
