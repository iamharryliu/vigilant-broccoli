'use client';

import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';
import './global.css';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider, useTheme } from './theme-context';
import { AppModeProvider } from './app-mode-context';

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { appearance } = useTheme();
  return <Theme appearance={appearance}>{children}</Theme>;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <AppModeProvider>
            <ThemeProvider>
              <ThemeWrapper>{children}</ThemeWrapper>
            </ThemeProvider>
          </AppModeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
