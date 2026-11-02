'use client';

import { Suspense } from 'react';
import { useEffect } from 'react';
import './global.css';
import { ThemeProvider } from '@vigilant-broccoli/react-lib';
import { Toaster } from '@vigilant-broccoli/react-lib/toaster';
import { DemoNotice } from './components/demo-notice.component';
import { AppSidebar } from './components/app-sidebar.component';
import { RunNotifications } from './components/run-notifications.component';
import { I18nProvider, useI18n } from './i18n';
import en from './i18n/en.json';

const THEME_STORAGE_KEY = 'job-hunt-next-theme';

const DocumentLanguage = () => {
  const { locale } = useI18n();

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
};

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
            <DocumentLanguage />
            <div className="flex h-screen">
              <Suspense>
                <AppSidebar />
              </Suspense>
              <main className="flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
                <DemoNotice />
                {children}
              </main>
            </div>
            <RunNotifications />
            <Toaster richColors closeButton position="bottom-right" />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
