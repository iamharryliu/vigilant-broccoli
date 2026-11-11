'use client';

import { useEffect, useState } from 'react';
import './global.css';
import { Menu } from 'lucide-react';
import { ThemeProvider } from '@vigilant-broccoli/react-lib';
import { Toaster } from '@vigilant-broccoli/react-lib/toaster';
import { DemoNotice } from './components/demo-notice.component';
import { AppSidebar } from './components/app-sidebar.component';
import { RunNotifications } from './components/run-notifications.component';
import { I18nProvider, useI18n, useTranslation } from './i18n';
import en from './i18n/en.json';

const THEME_STORAGE_KEY = 'job-hunt-next-theme';

const DocumentLanguage = () => {
  const { locale } = useI18n();

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
};

const AppShell = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen">
      <AppSidebar
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-3 md:hidden">
          <button
            type="button"
            aria-label={t('NAV.OPEN_MENU')}
            onClick={() => setSidebarOpen(open => !open)}
            className="cursor-pointer rounded-md p-1 hover:bg-muted"
          >
            <Menu size={20} />
          </button>
          <span className="font-semibold">{t('APP.LABEL')}</span>
        </header>
        <main className="flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
          <DemoNotice />
          {children}
        </main>
      </div>
    </div>
  );
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
            <AppShell>{children}</AppShell>
            <RunNotifications />
            <Toaster richColors closeButton position="bottom-right" />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
