'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from '@vigilant-broccoli/react-lib';
import { Toaster } from '@vigilant-broccoli/react-lib/toaster';
import { I18nProvider } from '../i18n';

const THEME_STORAGE_KEY = 'chat-theme';

export function RootProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider storageKey={THEME_STORAGE_KEY}>
      <I18nProvider>
        {children}
        <Toaster richColors closeButton position="bottom-right" />
      </I18nProvider>
    </ThemeProvider>
  );
}
