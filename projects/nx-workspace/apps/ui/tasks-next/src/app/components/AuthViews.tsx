'use client';

import { useEffect } from 'react';
import { GoogleSignInPage } from '@vigilant-broccoli/react-lib-auth';
import { AuthCallbackPage, signInWithGoogle } from '../../../libs/auth';
import {
  handOffPopupSession,
  isSignInPopup,
} from '../../../libs/sign-in-popup';
import { ROUTE } from '../app.const';
import { useTranslation } from '../i18n';

export function LoginView() {
  const { t } = useTranslation();
  return (
    <GoogleSignInPage
      appName={t('APP.NAME')}
      tagline={t('APP.TAGLINE')}
      onSignIn={signInWithGoogle}
    />
  );
}

export function AuthCallbackView() {
  const { t } = useTranslation();
  return (
    <div className="p-4">
      <AuthCallbackPage
        loadingLabel={t('AUTH.SIGNING_IN')}
        onSession={handOffPopupSession}
      />
    </div>
  );
}

// Opened by /embed's sign-in; starts Google sign-in first-party in the popup.
export function SignInPopupView() {
  const { t } = useTranslation();

  useEffect(() => {
    if (isSignInPopup()) void signInWithGoogle();
    else window.location.replace(ROUTE.LOGIN);
  }, []);

  return <p className="p-4">{t('AUTH.REDIRECTING')}</p>;
}
