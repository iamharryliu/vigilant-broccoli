'use client';

import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';
import './global.css';
import { ThemeProvider, useTheme } from './theme-context';
import { AppModeProvider } from './app-mode-context';

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { appearance } = useTheme();
  return <Theme appearance={appearance} scaling="90%">{children}</Theme>;
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
        <AppModeProvider>
          <ThemeProvider>
            <ThemeWrapper>{children}</ThemeWrapper>
          </ThemeProvider>
        </AppModeProvider>
      </body>
    </html>
  );
}
