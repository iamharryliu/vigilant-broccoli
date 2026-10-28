import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import {
  listCalendarEvents,
  isExpiredError,
  GoogleCalendarEvent,
} from '@vigilant-broccoli/google-workspace';
import { requireAuth } from '../../../../../libs/api-auth';
import { GOOGLE_TOKEN_EXPIRED } from '../../../../../libs/api-errors';

export const runtime = 'nodejs';

const AGENDA_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req, { requireGoogleToken: true });
  if (auth instanceof NextResponse) return auth;

  const calendarIds = req.nextUrl.searchParams.getAll('calendarId');
  const now = new Date();
  const timeMin = now.toISOString();
  const timeMax = new Date(now.getTime() + AGENDA_WINDOW_MS).toISOString();

  const results = await Promise.allSettled(
    calendarIds.map(calendarId =>
      listCalendarEvents(auth.googleToken as string, calendarId, {
        timeMin,
        timeMax,
      }),
    ),
  );

  if (results.some(r => r.status === 'rejected' && isExpiredError(r.reason))) {
    return NextResponse.json({ error: GOOGLE_TOKEN_EXPIRED }, { status: 401 });
  }

  const events = results
    .filter(
      (r): r is PromiseFulfilledResult<GoogleCalendarEvent[]> =>
        r.status === 'fulfilled',
    )
    .flatMap(r => r.value)
    .sort((a, b) => a.start.localeCompare(b.start));

  return NextResponse.json({ events });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, { requireGoogleToken: true });
  if (auth instanceof NextResponse) return auth;

  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: auth.googleToken as string });
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const body = await req.json();
    const calendarId = body.calendarId || 'primary';
    const timeZone = body.timeZone || 'America/New_York';

    const recurrence: string[] | undefined =
      body.recurrence?.length > 0 ? body.recurrence : undefined;

    const event = body.allDay
      ? {
          summary: body.summary,
          description: body.description,
          location: body.location,
          start: { date: body.start },
          end: { date: body.end || body.start },
          recurrence,
        }
      : {
          summary: body.summary,
          description: body.description,
          location: body.location,
          start: { dateTime: body.start, timeZone },
          end: { dateTime: body.end, timeZone },
          recurrence,
        };

    const response = await calendar.events.insert({
      calendarId,
      requestBody: event,
    });
    return NextResponse.json({ success: true, event: response.data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to create event';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
