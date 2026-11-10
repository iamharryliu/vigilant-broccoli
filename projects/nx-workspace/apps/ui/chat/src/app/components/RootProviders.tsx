'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from '@vigilant-broccoli/react-lib';
import { Toaster } from '@vigilant-broccoli/react-lib/toaster';

const THEME_STORAGE_KEY = 'chat-theme';

export function RootProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider storageKey={THEME_STORAGE_KEY}>
      {children}
      <Toaster richColors closeButton position="bottom-right" />
    </ThemeProvider>
  );
}
