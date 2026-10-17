'use client';

import { ReactNode, useSyncExternalStore } from 'react';
import { Monitor } from 'lucide-react';
import { APP_NAME } from '../app.consts';
import { useTranslation } from '../i18n';
import { usePageTitle } from '../use-page-title';

const UNSUPPORTED_DEVICE_QUERY =
  '(max-width: 1023px), (hover: none) and (pointer: coarse)';
const subscribe = (onChange: () => void) => {
  const media = window.matchMedia(UNSUPPORTED_DEVICE_QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
};
const isDesktop = () => !window.matchMedia(UNSUPPORTED_DEVICE_QUERY).matches;
const serverSnapshot = () => null;

export function DesktopOnly({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  usePageTitle(t('PAGE.HOME'));
  const supported = useSyncExternalStore<boolean | null>(
    subscribe,
    isDesktop,
    serverSnapshot,
  );
  if (supported) return children;
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background p-6 text-foreground">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <Monitor
          className="h-12 w-12 text-muted-foreground"
          aria-hidden="true"
        />
        <p className="text-sm font-semibold text-muted-foreground">
          {APP_NAME}
        </p>
        <h1 className="text-2xl font-bold">{t('DEVICE.TITLE')}</h1>
        <p role="status" className="text-sm text-muted-foreground">
          {t(supported === null ? 'DEVICE.CHECKING' : 'DEVICE.DESCRIPTION')}
        </p>
      </div>
    </main>
  );
}
