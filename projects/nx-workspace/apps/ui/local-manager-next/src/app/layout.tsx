'use client';

import './global.css';
import { ThemeProvider } from '@vigilant-broccoli/react-lib';
import { Toaster } from '@vigilant-broccoli/react-lib/toaster';
import { AuthProvider } from '../../libs/auth';
import { APP_NAME, SIDEBAR_ROUTE } from './app.const';
import { I18nProvider } from './i18n';

const THEME_STORAGE_KEY = 'vb-manager-next-theme';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>{`${SIDEBAR_ROUTE.INDEX.title} | ${APP_NAME}`}</title>
      </head>
      <body>
        <AuthProvider>
          <ThemeProvider
            storageKey={THEME_STORAGE_KEY}
            style={{ fontSize: '0.9rem' }}
          >
            <I18nProvider>
              {children}
              <Toaster richColors closeButton position="bottom-right" />
            </I18nProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
