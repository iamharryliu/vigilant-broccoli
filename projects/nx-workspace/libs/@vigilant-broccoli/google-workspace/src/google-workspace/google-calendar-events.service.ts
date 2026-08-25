import { google, calendar_v3 } from 'googleapis';
import { GoogleCalendarEvent } from './google-calendar-events.model';

const createClient = (accessToken: string) => {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.calendar({ version: 'v3', auth });
};

const eventTime = (time?: calendar_v3.Schema$EventDateTime | null) =>
  time?.dateTime ?? time?.date ?? '';

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
