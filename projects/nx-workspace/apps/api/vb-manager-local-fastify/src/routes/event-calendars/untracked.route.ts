import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { getUserEmail } from '../../libs/server-auth';
import { listEventCalendars } from '../../libs/event-calendars.db';
import {
  getCalendarAdminClient,
  listUntrackedCalendars,
} from '../../libs/google-calendar-admin';

export async function GET(request: Request) {
  const userEmail = await getUserEmail(request);
  if (!userEmail) {
    return Response.json(
      { error: 'Unauthorized' },
      { status: HTTP_STATUS_CODES.UNAUTHORIZED },
    );
  }

  try {
    const tracked = new Set(
      (await listEventCalendars()).map(calendar => calendar.googleCalendarId),
    );
    return Response.json(
      await listUntrackedCalendars(getCalendarAdminClient(), tracked),
    );
  } catch (error) {
    console.error('[event-calendars] untracked lookup failed', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unexpected error' },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}
