'use client';

import { ReactNode } from 'react';
import { ThemeProvider, useThemeKeybind } from '@vigilant-broccoli/react-lib';

function ThemeKeybindWrapper({ children }: { children: ReactNode }) {
  useThemeKeybind();
  return <>{children}</>;
}

export function RootThemeWrapper({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ThemeKeybindWrapper>{children}</ThemeKeybindWrapper>
    </ThemeProvider>
  );
}
