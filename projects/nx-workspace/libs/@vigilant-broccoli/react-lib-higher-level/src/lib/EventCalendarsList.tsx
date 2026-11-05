'use client';

import { CalendarDays, CalendarRange, Eye, EyeOff, List } from 'lucide-react';
import { CopyButton } from '@vigilant-broccoli/react-lib';

const EMPTY_MESSAGE = 'No event calendars yet.';
const FETCH_ERROR = 'Failed to load event calendars.';

export type EventCalendarLink = {
  id: string;
  name: string;
  googleCalendarId: string;
  url: string;
};

type CalendarViewMode = 'AGENDA' | 'WEEK' | 'MONTH';

const CALENDAR_VIEWS: {
  mode: CalendarViewMode;
  label: string;
  Icon: typeof List;
}[] = [
  { mode: 'AGENDA', label: 'Schedule', Icon: List },
  { mode: 'WEEK', label: 'Week', Icon: CalendarRange },
  { mode: 'MONTH', label: 'Month', Icon: CalendarDays },
];

const withViewMode = (url: string, mode: CalendarViewMode) =>
  `${url}&mode=${mode}`;

interface EventCalendarsListProps {
  calendars: EventCalendarLink[] | null;
  error: boolean;
  hiddenIds: Set<string>;
  onToggleHidden: (googleCalendarId: string) => void;
}

export const EventCalendarsList = ({
  calendars,
  error,
  hiddenIds,
  onToggleHidden,
}: EventCalendarsListProps) => {
  if (error)
    return (
      <p className="text-sm text-red-600 dark:text-red-400">{FETCH_ERROR}</p>
    );
  if (calendars === null) return null;
  if (calendars.length === 0) {
    return <p className="text-sm text-muted-foreground">{EMPTY_MESSAGE}</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {calendars.map(calendar => {
        const hidden = hiddenIds.has(calendar.googleCalendarId);
        const VisibilityIcon = hidden ? EyeOff : Eye;
        const visibilityLabel = `${hidden ? 'Show' : 'Hide'} ${calendar.name} in calendar`;
        return (
          <li
            key={calendar.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3"
          >
            <a
              href={calendar.url}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              {calendar.name}
            </a>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onToggleHidden(calendar.googleCalendarId)}
                aria-label={visibilityLabel}
                aria-pressed={!hidden}
                title={visibilityLabel}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <VisibilityIcon size={16} />
              </button>
              {CALENDAR_VIEWS.map(({ mode, label, Icon }) => (
                <a
                  key={mode}
                  href={withViewMode(calendar.url, mode)}
                  target="_blank"
                  rel="noreferrer"
                  title={label}
                  aria-label={`Open ${calendar.name} in ${label} view`}
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Icon size={16} />
                </a>
              ))}
              <CopyButton text={calendar.url} />
            </div>
          </li>
        );
      })}
    </ul>
  );
};
