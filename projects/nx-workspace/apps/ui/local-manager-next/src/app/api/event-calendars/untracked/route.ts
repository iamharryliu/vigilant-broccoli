import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { getUserEmail } from '../../../../../libs/server-auth';
import { listEventCalendars } from '../../../../lib/event-calendars.db';
import {
  getCalendarAdminClient,
  listUntrackedCalendars,
} from '../../../../lib/google-calendar-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const userEmail = await getUserEmail(request);
  if (!userEmail) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: HTTP_STATUS_CODES.UNAUTHORIZED },
    );
  }

  try {
    const tracked = new Set(
      (await listEventCalendars()).map(calendar => calendar.googleCalendarId),
    );
    return NextResponse.json(
      await listUntrackedCalendars(getCalendarAdminClient(), tracked),
    );
  } catch (error) {
    console.error('[event-calendars] untracked lookup failed', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected error' },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}
