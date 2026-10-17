'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from '@vigilant-broccoli/react-lib';

export function RootThemeWrapper({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
