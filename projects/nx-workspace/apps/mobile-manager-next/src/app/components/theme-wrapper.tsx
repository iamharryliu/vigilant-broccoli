'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from '@vigilant-broccoli/react-lib';

export const ThemeWrapper = ({ children }: { children: ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);
