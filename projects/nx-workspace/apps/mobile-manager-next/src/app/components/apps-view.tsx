'use client';

import { useRef, type MouseEvent } from 'react';
import { APP_SECTIONS, type AppEntry } from '../constants/apps';
import { I18nProvider, useTranslation } from '../i18n';
import { openApp } from '../utils/open-app';

const LIST =
  'flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto pb-[env(safe-area-inset-bottom)]';
const GRID =
  'grid grid-cols-4 content-start gap-x-3 gap-y-6 sm:grid-cols-6 md:grid-cols-8';
const HEADING =
  'mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400';

const AppsPicker = () => {
  const { t } = useTranslation();
  const setupRef = useRef<HTMLDetailsElement>(null);
  const handleClick = (event: MouseEvent, app: AppEntry) => {
    event.preventDefault();
    if (app.shortcutName && setupRef.current) setupRef.current.open = true;
    openApp(app);
  };

  return (
    <div className={LIST}>
      {APP_SECTIONS.map(({ title, apps }) => (
        <section key={title ?? 'personal'}>
          {title && <h2 className={HEADING}>{title}</h2>}
          <div className={GRID}>
            {apps.map(app => {
              const Tile = app.shortcutName ? 'button' : 'a';
              return (
                <Tile
                  key={app.label}
                  href={app.webUrl}
                  type={app.shortcutName ? 'button' : undefined}
                  aria-describedby={
                    app.shortcutName ? 'iphone-app-setup' : undefined
                  }
                  onClick={event => handleClick(event, app)}
                  className="flex min-h-[44px] flex-col items-center gap-1.5 text-center"
                >
                  <span
                    className={`flex aspect-square w-full max-w-16 items-center justify-center rounded-2xl text-white shadow-sm ${app.tileColor}`}
                  >
                    <app.icon size={28} aria-hidden="true" />
                  </span>
                  <span className="w-full truncate text-xs text-gray-700 dark:text-gray-300">
                    {app.label}
                  </span>
                  {app.shortcutName && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {t('APPS.REQUIRES_SETUP')}
                    </span>
                  )}
                </Tile>
              );
            })}
          </div>
          {!title && (
            <details
              ref={setupRef}
              id="iphone-app-setup"
              className="mt-4 text-sm text-gray-700 dark:text-gray-300"
            >
              <summary className="cursor-pointer">{t('APPS.SETUP')}</summary>
              <p className="mt-2">{t('APPS.SHORTCUT_HELP')}</p>
              <p className="mt-2">{t('APPS.LIMITATIONS')}</p>
            </details>
          )}
        </section>
      ))}
    </div>
  );
};

export const AppsView = () => (
  <I18nProvider>
    <AppsPicker />
  </I18nProvider>
);
