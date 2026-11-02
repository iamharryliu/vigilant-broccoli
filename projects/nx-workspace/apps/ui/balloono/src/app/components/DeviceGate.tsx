'use client';

import { ReactNode, useSyncExternalStore } from 'react';
import { useTranslation } from '../i18n';
import { usePageTitle } from '../use-page-title';

const HANDHELD_DEVICE_QUERY =
  '(max-width: 1023px), (hover: none) and (pointer: coarse)';
const subscribe = (onChange: () => void) => {
  const media = window.matchMedia(HANDHELD_DEVICE_QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
};
const isDesktop = () => !window.matchMedia(HANDHELD_DEVICE_QUERY).matches;
const serverSnapshot = () => null;

export function DeviceGate({
  desktop,
  handheld,
}: {
  desktop: ReactNode;
  handheld: ReactNode;
}) {
  const { t } = useTranslation();
  usePageTitle(t('PAGE.HOME'));
  const isDesktopDevice = useSyncExternalStore<boolean | null>(
    subscribe,
    isDesktop,
    serverSnapshot,
  );
  if (isDesktopDevice === null) return null;
  return isDesktopDevice ? desktop : handheld;
}
