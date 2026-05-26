import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../../libs/api-auth';

export const runtime = 'nodejs';

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
    const message =
      error instanceof Error ? error.message : 'Failed to create event';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
