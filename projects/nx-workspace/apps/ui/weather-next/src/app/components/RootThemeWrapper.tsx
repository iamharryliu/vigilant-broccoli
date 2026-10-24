'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from '@vigilant-broccoli/react-lib';

const THEME_STORAGE_KEY = 'weather-next-theme';

export function RootThemeWrapper({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider storageKey={THEME_STORAGE_KEY}>{children}</ThemeProvider>
  );
}
