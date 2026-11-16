import { useState } from 'react';
import {
  Button,
  CardContainer,
  GoogleSigninButton,
  Skeleton,
  ThemeProvider,
  useDocumentTitle,
} from '@vigilant-broccoli/react-lib';
import { authClient, VB_EXPRESS_URL } from './auth-client';
import { I18nProvider, useTranslation } from './i18n';

const THEME_STORAGE_KEY = 'sandbox-theme';
const GOOGLE_PROVIDER = 'google';

const SessionSkeleton = () => (
  <div className="flex flex-col gap-3">
    <Skeleton className="h-12 w-12 rounded-full" />
    <Skeleton className="h-5 w-48" />
    <Skeleton className="h-5 w-64" />
    <Skeleton className="h-9 w-24" />
  </div>
);

const GoogleSignIn = () => {
  const { t } = useTranslation();
  const { data, isPending, error } = authClient.useSession();
  const [actionError, setActionError] = useState<string>();

  useDocumentTitle(`${t('GOOGLE_SIGN_IN.PAGE_TITLE')} | ${t('SITE_NAME')}`);

  const signIn = async () => {
    setActionError(undefined);
    const result = await authClient.signIn.social({
      provider: GOOGLE_PROVIDER,
      callbackURL: window.location.href,
    });
    if (result.error) setActionError(result.error.message);
  };

  const signOut = async () => {
    setActionError(undefined);
    const result = await authClient.signOut();
    if (result.error) setActionError(result.error.message);
  };

  const errorMessage = actionError ?? error?.message;

  return (
    <CardContainer title={t('GOOGLE_SIGN_IN.TITLE')}>
      <p className="text-sm text-muted-foreground">
        {t('GOOGLE_SIGN_IN.API_BASE_URL', { url: VB_EXPRESS_URL })}
      </p>
      {isPending ? (
        <SessionSkeleton />
      ) : data ? (
        <div className="flex flex-col gap-3 text-foreground">
          {data.user.image && (
            <img
              src={data.user.image}
              alt=""
              referrerPolicy="no-referrer"
              className="h-12 w-12 rounded-full"
            />
          )}
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            <dt className="text-muted-foreground">
              {t('GOOGLE_SIGN_IN.NAME')}
            </dt>
            <dd>{data.user.name}</dd>
            <dt className="text-muted-foreground">
              {t('GOOGLE_SIGN_IN.EMAIL')}
            </dt>
            <dd>{data.user.email}</dd>
            <dt className="text-muted-foreground">
              {t('GOOGLE_SIGN_IN.SESSION_EXPIRES')}
            </dt>
            <dd>{new Date(data.session.expiresAt).toLocaleString()}</dd>
          </dl>
          <Button variant="outline" className="w-fit" onClick={signOut}>
            {t('GOOGLE_SIGN_IN.SIGN_OUT')}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-foreground">
            {t('GOOGLE_SIGN_IN.SIGNED_OUT')}
          </p>
          <GoogleSigninButton onClick={signIn} />
        </div>
      )}
      {errorMessage && (
        <p role="alert" className="text-sm text-destructive">
          {t('GOOGLE_SIGN_IN.ERROR', { message: errorMessage })}
        </p>
      )}
    </CardContainer>
  );
};

export function App() {
  return (
    <ThemeProvider storageKey={THEME_STORAGE_KEY}>
      <I18nProvider>
        <main className="mx-auto min-h-dvh max-w-md bg-background p-4">
          <GoogleSignIn />
        </main>
      </I18nProvider>
    </ThemeProvider>
  );
}

export default App;
