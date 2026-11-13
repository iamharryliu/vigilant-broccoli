'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { GoogleSignInPage } from '@vigilant-broccoli/react-lib-auth';
import { AuthCallbackPage, signInWithGoogle } from '../../../libs/auth';
import {
  HANDOFF_RESULT,
  handOffPopupSession,
  isSignInPopup,
  markSignInPopup,
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
  const [handoffFailed, setHandoffFailed] = useState(false);

  const handleSession = useCallback((session: Session | null) => {
    const result = handOffPopupSession(session);
    if (result === HANDOFF_RESULT.NO_OPENER) setHandoffFailed(true);
    return result !== HANDOFF_RESULT.NOT_POPUP;
  }, []);

  if (handoffFailed) {
    return <p className="p-4">{t('AUTH.HANDOFF_FAILED')}</p>;
  }

  return (
    <div className="p-4">
      <AuthCallbackPage
        loadingLabel={t('AUTH.SIGNING_IN')}
        onSession={handleSession}
      />
    </div>
  );
}

// Opened by /embed's sign-in; starts Google sign-in first-party in the popup.
export function SignInPopupView() {
  const { t } = useTranslation();

  useEffect(() => {
    markSignInPopup();
    if (isSignInPopup()) void signInWithGoogle();
    else window.location.replace(ROUTE.LOGIN);
  }, []);

  return <p className="p-4">{t('AUTH.REDIRECTING')}</p>;
}
