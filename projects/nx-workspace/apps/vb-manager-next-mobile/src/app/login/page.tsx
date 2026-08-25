'use client';

import { GoogleSignInPage } from '@vigilant-broccoli/react-lib';
import { signInWithGoogle } from '../providers/auth-provider';

const APP_NAME = 'VB Manager';
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
