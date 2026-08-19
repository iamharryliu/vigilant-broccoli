'use client';

import { GoogleSignInPage } from '@vigilant-broccoli/react-lib';
import { signInWithGoogle } from '../../../libs/auth';

const APP_NAME = 'VB Manager';

export default function LoginPage() {
  return <GoogleSignInPage appName={APP_NAME} onSignIn={signInWithGoogle} />;
}
