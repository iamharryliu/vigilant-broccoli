'use client';

import './global.css';
import { ThemeProvider } from '@vigilant-broccoli/react-lib';
import { Toaster } from '@vigilant-broccoli/react-lib/toaster';
import { APP_NAME } from './app.const';
import { I18nProvider } from './i18n';

// Same key as local-manager-next so the embedded app follows its theme override.
const THEME_STORAGE_KEY = 'vb-manager-next-theme';

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
        <ThemeProvider
          storageKey={THEME_STORAGE_KEY}
          style={{ fontSize: '0.9rem' }}
        >
          <I18nProvider>
            {children}
            <Toaster richColors closeButton position="bottom-right" />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
