'use client';

import type { MouseEvent } from 'react';
import { APPS, type AppEntry } from '../constants/apps';
import { openApp } from '../utils/open-app';

const GRID =
  'grid min-h-0 flex-1 grid-cols-4 content-start gap-x-3 gap-y-6 overflow-y-auto pb-[env(safe-area-inset-bottom)] sm:grid-cols-6 md:grid-cols-8';

export const AppsView = () => {
  const handleClick = (event: MouseEvent, app: AppEntry) => {
    event.preventDefault();
    openApp(app);
  };

  return (
    <div className={GRID}>
      {APPS.map(app => (
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
          <span className="w-full truncate text-xs text-gray-700">
            {app.label}
          </span>
        </a>
      ))}
    </div>
  );
};
