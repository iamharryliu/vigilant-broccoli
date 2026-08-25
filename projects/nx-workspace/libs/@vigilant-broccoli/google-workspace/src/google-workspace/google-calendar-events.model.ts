export interface GoogleCalendarEvent {
  id: string;
  calendarId: string;
  summary: string;
  start: string;
  end: string;
  allDay: boolean;
  htmlLink?: string;
}
