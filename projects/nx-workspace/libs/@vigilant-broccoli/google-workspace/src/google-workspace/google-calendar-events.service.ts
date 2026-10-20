import { google, calendar_v3 } from 'googleapis';
import {
  GoogleCalendarEvent,
  GoogleCalendarEventAttendee,
  GoogleCalendarEventPerson,
} from './google-calendar-events.model';

const createClient = (accessToken: string) => {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.calendar({ version: 'v3', auth });
};

const eventTime = (time?: calendar_v3.Schema$EventDateTime | null) =>
  time?.dateTime ?? time?.date ?? '';

const mapPerson = (
  person?: calendar_v3.Schema$Event['organizer'] | null,
): GoogleCalendarEventPerson | undefined =>
  person
    ? {
        displayName: person.displayName ?? undefined,
        email: person.email ?? undefined,
      }
    : undefined;

const mapAttendee = (
  attendee: calendar_v3.Schema$EventAttendee,
): GoogleCalendarEventAttendee => ({
  displayName: attendee.displayName ?? undefined,
  email: attendee.email ?? undefined,
  responseStatus: attendee.responseStatus ?? undefined,
  self: attendee.self ?? undefined,
  organizer: attendee.organizer ?? undefined,
});

const mapEvent =
  (calendarId: string) =>
  (event: calendar_v3.Schema$Event): GoogleCalendarEvent => ({
    id: event.id ?? '',
    calendarId,
    summary: event.summary ?? '(untitled)',
    start: eventTime(event.start),
    end: eventTime(event.end),
    allDay: !event.start?.dateTime,
    htmlLink: event.htmlLink ?? undefined,
    location: event.location ?? undefined,
    description: event.description ?? undefined,
    hangoutLink: event.hangoutLink ?? undefined,
    attendees: event.attendees?.map(mapAttendee),
    organizer: mapPerson(event.organizer),
    recurringEventId: event.recurringEventId ?? undefined,
  });

export const listCalendarEvents = async (
  accessToken: string,
  calendarId: string,
  {
    timeMin,
    timeMax,
    maxResults = 50,
  }: { timeMin: string; timeMax: string; maxResults?: number },
): Promise<GoogleCalendarEvent[]> => {
  const client = createClient(accessToken);
  const res = await client.events.list({
    calendarId,
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: 'startTime',
    maxResults,
  });
  return (res.data.items ?? []).map(mapEvent(calendarId));
};
