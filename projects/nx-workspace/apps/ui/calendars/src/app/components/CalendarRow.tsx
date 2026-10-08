'use client';

import { CalendarDays, CalendarRange, List } from 'lucide-react';
import { CopyButton } from '@vigilant-broccoli/react-lib';
import { withViewMode } from '../../lib/calendar-links';
import { CALENDAR_VIEW_MODE } from '../../lib/calendars.consts';
import { CalendarLink, CalendarViewMode } from '../../lib/calendars.types';
import { useTranslation } from '../i18n';

const CALENDAR_VIEWS: { mode: CalendarViewMode; Icon: typeof List }[] = [
  { mode: CALENDAR_VIEW_MODE.AGENDA, Icon: List },
  { mode: CALENDAR_VIEW_MODE.WEEK, Icon: CalendarRange },
  { mode: CALENDAR_VIEW_MODE.MONTH, Icon: CalendarDays },
];

const ICON_SIZE = 16;

export const CalendarRow = ({ calendar }: { calendar: CalendarLink }) => {
  const { t } = useTranslation();

  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
      <a
        href={calendar.url}
        target="_blank"
        rel="noreferrer"
        className="min-w-0 break-words text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
      >
        {calendar.name}
      </a>
      <div className="flex shrink-0 items-center gap-1">
        {CALENDAR_VIEWS.map(({ mode, Icon }) => {
          const view = t(`VIEW.${mode}`);
          return (
            <a
              key={mode}
              href={withViewMode(calendar.url, mode)}
              target="_blank"
              rel="noreferrer"
              title={view}
              aria-label={t('ACTIONS.OPEN_VIEW', {
                name: calendar.name,
                view,
              })}
              className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            >
              <Icon size={ICON_SIZE} />
            </a>
          );
        })}
        <CopyButton
          text={calendar.url}
          label={t('ACTIONS.COPY_LINK', { name: calendar.name })}
        />
      </div>
    </li>
  );
};
