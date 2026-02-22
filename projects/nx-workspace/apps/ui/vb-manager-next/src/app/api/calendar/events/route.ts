import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';

const getAuthenticatedCalendarClient = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    throw new Error('Not authenticated');
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: session.accessToken,
  });

  return google.calendar({ version: 'v3', auth: oauth2Client });
};

export async function GET(req: NextRequest) {
  try {
    const calendar = await getAuthenticatedCalendarClient();
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
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to fetch events',
      },
      { status: 500 },
    );
  }
}
