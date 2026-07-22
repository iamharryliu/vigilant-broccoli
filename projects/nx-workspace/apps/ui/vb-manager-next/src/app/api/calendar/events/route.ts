import { google } from 'googleapis';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { isExpiredError } from '@vigilant-broccoli/google-workspace';
import { NextRequest, NextResponse } from 'next/server';
import { getGoogleAccessTokenForRequest } from '../../../../../libs/google-token';

export const runtime = 'nodejs';

const getAuthenticatedCalendarClient = async (req: NextRequest) => {
  const accessToken = await getGoogleAccessTokenForRequest(req);

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken,
  });

  return google.calendar({ version: 'v3', auth: oauth2Client });
};

const errorResponse = (error: unknown, fallback: string) => {
  if (isExpiredError(error)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: HTTP_STATUS_CODES.UNAUTHORIZED },
    );
  }
  return NextResponse.json(
    { error: error instanceof Error ? error.message : fallback },
    { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
  );
};

export async function GET(req: NextRequest) {
  try {
    const calendar = await getAuthenticatedCalendarClient(req);
    const calendarId = req.nextUrl.searchParams.get('calendarId') || 'primary';

    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + 7);

    const response = await calendar.events.list({
      calendarId,
      timeMin: now.toISOString(),
      timeMax: endOfWeek.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 50,
    });

    const events = response.data.items || [];

    const todayEvents = events.filter(event => {
      const eventStart = new Date(
        event.start?.dateTime || event.start?.date || '',
      );
      return eventStart <= endOfDay;
    });

    const upcomingEvents = events.filter(event => {
      const eventStart = new Date(
        event.start?.dateTime || event.start?.date || '',
      );
      return eventStart > endOfDay;
    });

    return NextResponse.json({
      success: true,
      todayEvents,
      upcomingEvents,
    });
  } catch (error) {
    return errorResponse(error, 'Failed to fetch events');
  }
}

export async function POST(req: NextRequest) {
  try {
    const calendar = await getAuthenticatedCalendarClient(req);
    const body = await req.json();
    const calendarId = body.calendarId || 'primary';
    const timeZone = body.timeZone || 'America/New_York';

    const event = body.allDay
      ? {
          summary: body.summary,
          description: body.description,
          location: body.location,
          start: { date: body.start },
          end: { date: body.end || body.start },
        }
      : {
          summary: body.summary,
          description: body.description,
          location: body.location,
          start: { dateTime: body.start, timeZone },
          end: { dateTime: body.end, timeZone },
        };

    const response = await calendar.events.insert({
      calendarId,
      requestBody: event,
    });

    return NextResponse.json({ success: true, event: response.data });
  } catch (error) {
    return errorResponse(error, 'Failed to create event');
  }
}
