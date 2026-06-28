'use client';

import { ReactNode } from 'react';
import { Theme } from '@radix-ui/themes';
import { ThemeProvider, useTheme } from '@vigilant-broccoli/react-lib';

function ThemedRadixWrapper({ children }: { children: ReactNode }) {
  const { appearance } = useTheme();
  return <Theme appearance={appearance}>{children}</Theme>;
}

export function RootThemeWrapper({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ThemedRadixWrapper>{children}</ThemedRadixWrapper>
    </ThemeProvider>
  );
}
