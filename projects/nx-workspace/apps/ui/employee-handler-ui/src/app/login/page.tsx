'use client';

import { GoogleSigninButton } from '@vigilant-broccoli/react-lib';
import { Text } from '@radix-ui/themes';
import { supabase } from '../../../libs/supabase';
import { APP_LABEL } from '../app.consts';
import { ROUTES } from '../../lib/routes';

const APP_TAGLINE = 'Sign in to manage employees and signatures';

export default function LoginPage() {
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
            {APP_LABEL}
          </Text>
          <Text size="2" color="gray" as="div">
            {APP_TAGLINE}
          </Text>
        </div>
        <GoogleSigninButton onClick={handleGoogleSignIn} />
      </div>
    </main>
  );
}
