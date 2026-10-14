import { GOOGLE_CALENDAR } from '@vigilant-broccoli/common-browser';
import { EMAIL_ADDRESS } from './email-address.const';

export const PERSONAL_GOOGLE_CALENDAR = {
  PERSONAL: EMAIL_ADDRESS,
  BIRTHDAYS:
    'f61b08e940f7c4fb8becf0d419c8c09f7e0c46d6d03343637aef5837c766a09b@group.calendar.google.com',
  H_AND_K:
    '539abad77f9d2e321ea402608c2b33fbf88ea71de29e916dff3a00c5de1686b0@group.calendar.google.com',
} as const;

export type PersonalCalendarSource = {
  id: string;
  color: string;
  label: string;
  kind: 'owner' | 'shared';
};

// The only sources safe for public sites: the personal calendar is already
// linked there and the rest are Google's public calendars. Keep private
// shared calendars out of this list so they never reach a public bundle.
export const PUBLIC_CALENDAR_SOURCES: readonly PersonalCalendarSource[] = [
  {
    id: PERSONAL_GOOGLE_CALENDAR.PERSONAL,
    color: GOOGLE_CALENDAR.CALENDAR_COLOR.GREEN,
    label: 'Personal',
    kind: 'owner',
  },
  {
    id: GOOGLE_CALENDAR.PUBLIC_CALENDAR.COUNTRY_CALENDAR.SWEDEN,
    color: GOOGLE_CALENDAR.CALENDAR_COLOR.PURPLE,
    label: 'Sweden holidays',
    kind: 'shared',
  },
  {
    id: GOOGLE_CALENDAR.PUBLIC_CALENDAR.COUNTRY_CALENDAR.CANADA,
    color: GOOGLE_CALENDAR.CALENDAR_COLOR.RED,
    label: 'Canada holidays',
    kind: 'shared',
  },
  {
    id: GOOGLE_CALENDAR.PUBLIC_CALENDAR.COUNTRY_CALENDAR.CHINA,
    color: GOOGLE_CALENDAR.CALENDAR_COLOR.ORANGE,
    label: 'China holidays',
    kind: 'shared',
  },
  {
    id: GOOGLE_CALENDAR.PUBLIC_CALENDAR.PHASES_OF_THE_MOON,
    color: GOOGLE_CALENDAR.CALENDAR_COLOR.DARK_PINK,
    label: 'Moon phases',
    kind: 'shared',
  },
];

// Single source of truth for the calendars embedded in the manager web and
// mobile apps, so the two stay in sync.
export const PERSONAL_CALENDAR_SOURCES: readonly PersonalCalendarSource[] = [
  ...PUBLIC_CALENDAR_SOURCES,
  {
    id: PERSONAL_GOOGLE_CALENDAR.BIRTHDAYS,
    color: GOOGLE_CALENDAR.CALENDAR_COLOR.BLUE,
    label: 'Birthdays',
    kind: 'shared',
  },
  {
    id: PERSONAL_GOOGLE_CALENDAR.H_AND_K,
    color: GOOGLE_CALENDAR.CALENDAR_COLOR.PINK,
    label: 'H&K',
    kind: 'shared',
  },
];
