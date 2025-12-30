export interface CalendarSource {
  email: string;
  color?: string;
}

export interface SharedCalendar {
  id: string;
  color?: string;
}

export interface CalendarConfig {
  height: number;
  wkst: number;
  ctz: string;
  showPrint: number;
  mode: 'AGENDA' | 'WEEK' | 'MONTH';
  title?: string;
  ownerCalendars: CalendarSource[];
  sharedCalendars: SharedCalendar[];
}
