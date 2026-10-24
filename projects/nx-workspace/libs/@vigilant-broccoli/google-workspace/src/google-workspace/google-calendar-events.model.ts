export interface GoogleCalendarEventPerson {
  displayName?: string;
  email?: string;
}

export interface GoogleCalendarEventAttendee extends GoogleCalendarEventPerson {
  // Google's needsAction | declined | tentative | accepted.
  responseStatus?: string;
  self?: boolean;
  organizer?: boolean;
}

export interface GoogleCalendarEvent {
  id: string;
  calendarId: string;
  summary: string;
  start: string;
  end: string;
  allDay: boolean;
  htmlLink?: string;
  location?: string;
  description?: string;
  hangoutLink?: string;
  attendees?: GoogleCalendarEventAttendee[];
  organizer?: GoogleCalendarEventPerson;
  recurringEventId?: string;
}
