'use client';

import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';
import './global.css';
import { ThemeProvider, useTheme, Toaster } from '@vigilant-broccoli/react-lib';
import { AuthProvider } from '../../libs/auth';

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
        <title>vb-manager-next</title>
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
