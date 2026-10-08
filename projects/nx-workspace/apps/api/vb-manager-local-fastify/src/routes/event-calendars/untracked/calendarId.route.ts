import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { getUserEmail } from '../../../libs/server-auth';
import { listEventCalendars } from '../../../libs/event-calendars.db';
import {
  deleteGoogleCalendar,
  getCalendarAdminClient,
} from '../../../libs/google-calendar-admin';

type RouteContext = { params: { calendarId: string } };

const TRACKED_CALENDAR_ERROR =
  'That calendar is managed on this page — delete it from its own row instead';

export async function DELETE(request: Request, { params }: RouteContext) {
  const userEmail = await getUserEmail(request);
  if (!userEmail) {
    return Response.json(
      { error: 'Unauthorized' },
      { status: HTTP_STATUS_CODES.UNAUTHORIZED },
    );
  }

  const { calendarId } = params;

  // Re-check against the table rather than trusting the client: this endpoint
  // destroys a calendar and every event on it, and the only thing making that
  // acceptable is that the target is genuinely unmanaged.
  const isTracked = (await listEventCalendars()).some(
    calendar => calendar.googleCalendarId === calendarId,
  );
  if (isTracked) {
    return Response.json(
      { error: TRACKED_CALENDAR_ERROR },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  try {
    await deleteGoogleCalendar(getCalendarAdminClient(), calendarId);
    return new Response(null, { status: HTTP_STATUS_CODES.NO_CONTENT });
  } catch (error) {
    console.error('[event-calendars] untracked delete failed', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unexpected error' },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}
