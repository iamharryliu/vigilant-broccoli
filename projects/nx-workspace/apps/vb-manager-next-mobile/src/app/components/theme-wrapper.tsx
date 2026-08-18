'use client';

import { ReactNode } from 'react';
import { Theme } from '@radix-ui/themes';
import { ThemeProvider, useTheme } from '@vigilant-broccoli/react-lib';

const ThemedRadixWrapper = ({ children }: { children: ReactNode }) => {
  const { appearance } = useTheme();
  return <Theme appearance={appearance}>{children}</Theme>;
};

export const ThemeWrapper = ({ children }: { children: ReactNode }) => (
  <ThemeProvider>
    <ThemedRadixWrapper>{children}</ThemedRadixWrapper>
  </ThemeProvider>
);
