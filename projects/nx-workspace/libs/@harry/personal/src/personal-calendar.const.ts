import { GOOGLE_CALENDAR } from '@vigilant-broccoli/common-browser';
import { EMAIL_ADDRESS } from './email-address.const';

export const PERSONAL_GOOGLE_CALENDAR = {
  PERSONAL: EMAIL_ADDRESS,
} as const;

export type PersonalCalendarSource = {
  id: string;
  color: string;
  label: string;
  kind: 'owner' | 'shared';
};

// The only sources safe for public sites: the personal calendar is already
// linked there and the rest are Google's public calendars. Keep private
// shared calendars (@harry/private) out of this list so they never reach a
// public bundle.
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
