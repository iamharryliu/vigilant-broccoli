'use client';

import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';
import './global.css';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider, useTheme, Toaster } from '@vigilant-broccoli/react-lib';
import { useDeployNotifications } from './hooks/useDeployNotifications';

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { appearance } = useTheme();
  useDeployNotifications();
  return (
    <Theme appearance={appearance} scaling="90%">
      {children}
      <Toaster richColors position="bottom-right" />
    </Theme>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>vb-manager-next</title>
      </head>
      <body>
        <SessionProvider>
          <ThemeProvider>
            <ThemeWrapper>{children}</ThemeWrapper>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
