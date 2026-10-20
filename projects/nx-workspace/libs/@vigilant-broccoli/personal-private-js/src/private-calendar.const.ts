import { GOOGLE_CALENDAR } from '@vigilant-broccoli/common-browser';
import {
  buildBaseCalendarConfig,
  PersonalCalendarSource,
  PUBLIC_CALENDAR_SOURCES,
} from '@vigilant-broccoli/personal-common-js';

export const PRIVATE_GOOGLE_CALENDAR = {
  BIRTHDAYS:
    'f61b08e940f7c4fb8becf0d419c8c09f7e0c46d6d03343637aef5837c766a09b@group.calendar.google.com',
  H_AND_K:
    '539abad77f9d2e321ea402608c2b33fbf88ea71de29e916dff3a00c5de1686b0@group.calendar.google.com',
} as const;

// Single source of truth for the calendars embedded in the manager web and
// mobile apps, so the two stay in sync.
export const PERSONAL_CALENDAR_SOURCES: readonly PersonalCalendarSource[] = [
  ...PUBLIC_CALENDAR_SOURCES,
  {
    id: PRIVATE_GOOGLE_CALENDAR.BIRTHDAYS,
    color: GOOGLE_CALENDAR.CALENDAR_COLOR.BLUE,
    label: 'Birthdays',
    kind: 'shared',
  },
  {
    id: PRIVATE_GOOGLE_CALENDAR.H_AND_K,
    color: GOOGLE_CALENDAR.CALENDAR_COLOR.PINK,
    label: 'H&K',
    kind: 'shared',
  },
];

export const BASE_CALENDAR_CONFIG = buildBaseCalendarConfig(
  PERSONAL_CALENDAR_SOURCES,
  'Personal Calendar',
);
