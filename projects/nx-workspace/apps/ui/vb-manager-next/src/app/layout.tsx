'use client';

import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';
import './global.css';
import { ThemeProvider, useTheme } from '@vigilant-broccoli/react-lib';
import { Toaster } from '@vigilant-broccoli/react-lib/toaster';
import { AuthProvider } from '../../libs/auth';
import { APP_NAME } from './app.const';

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { appearance } = useTheme();
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
        <title>{APP_NAME}</title>
      </head>
      <body>
        <AuthProvider>
          <ThemeProvider>
            <ThemeWrapper>{children}</ThemeWrapper>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
