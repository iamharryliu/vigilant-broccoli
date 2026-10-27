'use client';

import type { MouseEvent } from 'react';
import { APP_SECTIONS, type AppEntry } from '../constants/apps';
import { openApp } from '../utils/open-app';

const LIST =
  'flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto pb-[env(safe-area-inset-bottom)]';
const GRID =
  'grid grid-cols-4 content-start gap-x-3 gap-y-6 sm:grid-cols-6 md:grid-cols-8';
const HEADING =
  'mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400';

export const AppsView = () => {
  const handleClick = (event: MouseEvent, app: AppEntry) => {
    event.preventDefault();
    openApp(app);
  };

  return (
    <div className={LIST}>
      {APP_SECTIONS.map(({ title, apps }) => (
        <section key={title ?? 'personal'}>
          {title && <h2 className={HEADING}>{title}</h2>}
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
  );
};
