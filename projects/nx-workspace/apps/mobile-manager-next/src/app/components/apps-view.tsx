'use client';

import { useState, type MouseEvent } from 'react';
import { SearchInput } from '@vigilant-broccoli/react-lib';
import { I18nProvider, useTranslation } from '../i18n';
import { APP_SECTIONS, type AppEntry } from '../constants/apps';
import { openApp } from '../utils/open-app';

const LIST =
  'flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto pb-[env(safe-area-inset-bottom)]';
const GRID =
  'grid grid-cols-4 content-start gap-x-3 gap-y-6 sm:grid-cols-6 md:grid-cols-8';
const HEADING =
  'mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400';

const AppsContent = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const query = search.trim().toLowerCase();
  const sections = APP_SECTIONS.map(section => ({
    ...section,
    apps: section.apps.filter(app => app.label.toLowerCase().includes(query)),
  })).filter(section => section.apps.length > 0);

  const handleClick = (event: MouseEvent, app: AppEntry) => {
    event.preventDefault();
    openApp(app);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <div className="shrink-0">
        <SearchInput
          type="search"
          aria-label={t('APPS.SEARCH')}
          placeholder={t('APPS.SEARCH')}
          value={search}
          onChange={event => setSearch(event.target.value)}
          className="h-11 text-base text-foreground"
        />
      </div>
      <div className={LIST}>
        {sections.length === 0 && (
          <p role="status" className="text-sm text-muted-foreground">
            {t('APPS.NO_RESULTS')}
          </p>
        )}
        {sections.map(({ titleKey, apps }) => (
          <section key={titleKey}>
            <h2 className={HEADING}>{t(titleKey)}</h2>
            <div className={GRID}>
              {apps.map(app => (
                <a
                  key={app.label}
                  href={app.webUrl}
                  onClick={event => handleClick(event, app)}
                  className="flex min-h-[44px] flex-col items-center gap-1.5 text-center"
                >
                  <span
                    className={`flex aspect-square w-full max-w-16 items-center justify-center rounded-2xl text-white shadow-sm ${app.tileColor}`}
                  >
                    <app.icon size={28} />
                  </span>
                  <span className="w-full truncate text-xs text-gray-700 dark:text-gray-300">
                    {app.label}
                  </span>
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export const AppsView = () => (
  <I18nProvider>
    <AppsContent />
  </I18nProvider>
);
