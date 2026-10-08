import {
  CALENDAR_SECTION_STATE,
  CALENDAR_VIEW_MODE,
  LOAD_STATUS,
} from './calendars.consts';

export type CalendarViewMode =
  (typeof CALENDAR_VIEW_MODE)[keyof typeof CALENDAR_VIEW_MODE];

export type CalendarLink = {
  id: string;
  name: string;
  url: string;
};

export type EventCalendarsResult =
  | { status: typeof LOAD_STATUS.OK; calendars: CalendarLink[] }
  | { status: typeof LOAD_STATUS.ERROR };

export type CalendarSectionState =
  (typeof CALENDAR_SECTION_STATE)[keyof typeof CALENDAR_SECTION_STATE];
