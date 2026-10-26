'use client';

import './global.css';
import { ThemeProvider } from '@vigilant-broccoli/react-lib';
import { Toaster } from '@vigilant-broccoli/react-lib/toaster';
import { AppNav } from './components/app-nav.component';
import { RunNotifications } from './components/run-notifications.component';
import { I18nProvider } from './i18n';
import en from './i18n/en.json';

const THEME_STORAGE_KEY = 'job-applications-next-theme';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>{`${en.NAV.APPLICATIONS} | ${en.APP.LABEL}`}</title>
      </head>
      <body>
        <ThemeProvider storageKey={THEME_STORAGE_KEY}>
          <I18nProvider>
            <AppNav />
            <main className="mx-auto flex max-w-5xl flex-col gap-4 p-4">
              {children}
            </main>
            <RunNotifications />
            <Toaster richColors closeButton position="bottom-right" />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
