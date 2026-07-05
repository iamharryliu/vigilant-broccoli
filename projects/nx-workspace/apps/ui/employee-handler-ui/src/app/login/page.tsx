'use client';

import { GoogleSigninButton } from '@vigilant-broccoli/react-lib';
import { Text } from '@radix-ui/themes';
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
    <main className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="w-full max-w-sm mx-4 rounded-2xl border border-border bg-white dark:bg-gray-950 shadow-sm p-8 space-y-6">
        <div className="space-y-2 text-center">
          <Text size="6" weight="bold" as="div">
            {t('APP.LABEL')}
          </Text>
          <Text size="2" color="gray" as="div">
            {t('APP.TAGLINE')}
          </Text>
        </div>
        <GoogleSigninButton onClick={handleGoogleSignIn} />
      </div>
    </main>
  );
}
