'use client';

import { GoogleSignInPage } from '@vigilant-broccoli/react-lib';
import { signInWithGoogle } from '../../../libs/auth';
import { APP_NAME, PAGE_TITLE } from '../app.const';
import { usePageTitle } from '../use-page-title';

export default function LoginPage() {
  usePageTitle(PAGE_TITLE.LOGIN);
  return <GoogleSignInPage appName={APP_NAME} onSignIn={signInWithGoogle} />;
}
