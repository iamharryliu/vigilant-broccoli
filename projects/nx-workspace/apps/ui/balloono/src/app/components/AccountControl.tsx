'use client';

import { Button } from '@vigilant-broccoli/react-lib';
import { signInWithGoogle, signOut } from '../../lib/auth';
import { ONLINE_AVAILABLE } from '../app.consts';
import { displayNameOf, useSession } from '../hooks/useSession';
import { useTranslation } from '../i18n';

export function AccountControl() {
  const { t } = useTranslation();
  const session = useSession();
  if (!ONLINE_AVAILABLE) return null;

  if (!session) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => void signInWithGoogle()}
      >
        {t('ACCOUNT.SIGN_IN')}
      </Button>
    );
  }
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="truncate text-xs text-muted-foreground">
        {displayNameOf(session) || session.user.email}
      </span>
      <Button variant="outline" size="sm" onClick={() => void signOut()}>
        {t('ACCOUNT.SIGN_OUT')}
      </Button>
    </div>
  );
}
