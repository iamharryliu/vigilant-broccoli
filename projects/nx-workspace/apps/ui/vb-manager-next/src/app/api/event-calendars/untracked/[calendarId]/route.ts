import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { getUserEmail } from '../../../../../../libs/server-auth';
import { listEventCalendars } from '../../../../../lib/event-calendars.db';
import {
  deleteGoogleCalendar,
  getCalendarAdminClient,
} from '../../../../../lib/google-calendar-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ calendarId: string }> };

const TRACKED_CALENDAR_ERROR =
  'That calendar is managed on this page — delete it from its own row instead';

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const userEmail = await getUserEmail(request);
  if (!userEmail) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: HTTP_STATUS_CODES.UNAUTHORIZED },
    );
  }

  const { calendarId } = await params;

  // Re-check against the table rather than trusting the client: this endpoint
  // destroys a calendar and every event on it, and the only thing making that
  // acceptable is that the target is genuinely unmanaged.
  const isTracked = listEventCalendars().some(
    calendar => calendar.googleCalendarId === calendarId,
  );
  if (isTracked) {
    return NextResponse.json(
      { error: TRACKED_CALENDAR_ERROR },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  try {
    await deleteGoogleCalendar(getCalendarAdminClient(), calendarId);
    return new NextResponse(null, { status: HTTP_STATUS_CODES.NO_CONTENT });
  } catch (error) {
    console.error('[event-calendars] untracked delete failed', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected error' },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}
