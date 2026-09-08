'use client';

import { GoogleSignInPage } from '@vigilant-broccoli/react-lib';
import { signInWithGoogle } from '../providers/auth-provider';
import { APP_NAME } from '../app.const';

const APP_TAGLINE = 'Sign in to manage your calendar';

export default function LoginPage() {
  return (
    <GoogleSignInPage
      appName={APP_NAME}
      tagline={APP_TAGLINE}
      onSignIn={signInWithGoogle}
    />
  );
}
