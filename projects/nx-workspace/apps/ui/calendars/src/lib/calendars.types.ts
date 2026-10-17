import { CALENDAR_SECTION_STATE, CALENDAR_VIEW_MODE } from './calendars.consts';

export type CalendarViewMode =
  (typeof CALENDAR_VIEW_MODE)[keyof typeof CALENDAR_VIEW_MODE];

export type CalendarLink = {
  id: string;
  name: string;
  url: string;
};

export type CalendarSectionState =
  (typeof CALENDAR_SECTION_STATE)[keyof typeof CALENDAR_SECTION_STATE];
