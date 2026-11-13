'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from '@vigilant-broccoli/react-lib';
import { AuthProvider } from '../../../libs/auth';
import { I18nProvider } from '../i18n';

const THEME_STORAGE_KEY = 'tasks-next-theme';

export function RootProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider storageKey={THEME_STORAGE_KEY}>
      <I18nProvider>
        <AuthProvider>{children}</AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
