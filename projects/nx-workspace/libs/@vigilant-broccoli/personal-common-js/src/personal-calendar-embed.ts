import {
  buildCalendarUrl,
  CalendarConfig,
  GOOGLE_CALENDAR,
} from '@vigilant-broccoli/common-browser';
import { PERSONAL_CALENDAR_SOURCES } from './personal-calendar.const';

export const BASE_CALENDAR_CONFIG: Omit<CalendarConfig, 'mode'> = {
  height: 600,
  wkst: 2,
  ctz: GOOGLE_CALENDAR.TIMEZONE.COPENHAGEN,
  showPrint: 0,
  title: 'Personal Calendar',
  ownerCalendars: PERSONAL_CALENDAR_SOURCES.filter(
    source => source.kind === 'owner',
  ).map(source => ({ email: source.id, color: source.color })),
  sharedCalendars: PERSONAL_CALENDAR_SOURCES.filter(
    source => source.kind === 'shared',
  ).map(source => ({ id: source.id, color: source.color })),
};

// Colors not already claimed by PERSONAL_CALENDAR_SOURCES, so an event
// calendar never visually matches a personal/public one. Cycled if
// there are more event calendars than spare colors.
export const EVENT_CALENDAR_COLORS = [
  GOOGLE_CALENDAR.CALENDAR_COLOR.LIGHT_BLUE,
  GOOGLE_CALENDAR.CALENDAR_COLOR.DARK_GREEN,
];

export const getEventCalendarColor = (index: number) =>
  EVENT_CALENDAR_COLORS[index % EVENT_CALENDAR_COLORS.length];

// Each app passes its own storage key and keeps its own hidden ids.
export const readHiddenCalendarIds = (storageKey: string): string[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const writeHiddenCalendarIds = (
  storageKey: string,
  ids: Iterable<string>,
) => {
  try {
    localStorage.setItem(storageKey, JSON.stringify([...ids]));
  } catch {
    // Storage unavailable (private mode / quota): visibility just isn't persisted.
  }
};

export interface EmbedEventCalendar {
  // What the app persists in its hidden list; the apps differ on whether that
  // is the row id or the Google calendar id.
  hiddenKey: string;
  googleCalendarId: string;
}

export const buildEventCalendarEmbedUrl = ({
  mode,
  eventCalendars,
  hiddenKeys,
}: {
  mode: CalendarConfig['mode'];
  eventCalendars: readonly EmbedEventCalendar[];
  hiddenKeys: Iterable<string>;
}) => {
  const hidden = new Set(hiddenKeys);
  return buildCalendarUrl({
    ...BASE_CALENDAR_CONFIG,
    mode,
    sharedCalendars: [
      ...BASE_CALENDAR_CONFIG.sharedCalendars,
      // Colors are assigned before filtering so hiding one calendar doesn't
      // recolor the rest.
      ...eventCalendars
        .map((calendar, index) => ({
          calendar,
          color: getEventCalendarColor(index),
        }))
        .filter(({ calendar }) => !hidden.has(calendar.hiddenKey))
        .map(({ calendar, color }) => ({
          id: calendar.googleCalendarId,
          color,
        })),
    ],
  });
};
