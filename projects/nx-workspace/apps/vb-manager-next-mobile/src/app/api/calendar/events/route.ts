import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const getCalendarClient = (req: NextRequest) => {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) throw new Error('Not authenticated');

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: token });
  return google.calendar({ version: 'v3', auth: oauth2Client });
};

export async function POST(req: NextRequest) {
  try {
    const calendar = getCalendarClient(req);
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
    const status = message === 'Not authenticated' ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
