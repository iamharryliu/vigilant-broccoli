import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { getUserEmail } from '../../../../libs/server-auth';
import {
  insertEventCalendar,
  listEventCalendars,
} from '../../../lib/event-calendars.db';
import {
  createGoogleCalendar,
  getCalendarAdminClient,
  setGoogleCalendarPublic,
} from '../../../lib/google-calendar-admin';
import { normalizeSources } from './sources';
import { EVENT_LANGUAGES } from '../../constants/event-calendars';
import { startSync } from '../../../lib/event-scraper/sync-runner';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CALENDAR_TIME_ZONE = 'Europe/Stockholm';
const NAME_REQUIRED_ERROR = 'Calendar name is required';
const UNSUPPORTED_LANGUAGE_ERROR = `Language must be one of: ${EVENT_LANGUAGES.join(', ')}`;

const unauthorized = () =>
  NextResponse.json(
    { error: 'Unauthorized' },
    { status: HTTP_STATUS_CODES.UNAUTHORIZED },
  );

const serverError = (error: unknown) => {
  console.error('[event-calendars]', error);
  return NextResponse.json(
    { error: error instanceof Error ? error.message : 'Unexpected error' },
    { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
  );
};

export async function GET(request: NextRequest) {
  const userEmail = await getUserEmail(request);
  if (!userEmail) return unauthorized();

  try {
    return NextResponse.json({ calendars: await listEventCalendars() });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: NextRequest) {
  const userEmail = await getUserEmail(request);
  if (!userEmail) return unauthorized();

  const {
    name,
    isPublic = false,
    language,
    sources = [],
  } = await request.json();
  if (!name?.trim()) {
    return NextResponse.json(
      { error: NAME_REQUIRED_ERROR },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  if (language && !EVENT_LANGUAGES.includes(language)) {
    return NextResponse.json(
      { error: UNSUPPORTED_LANGUAGE_ERROR },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  const normalizedSources = normalizeSources(sources);
  if (!normalizedSources.ok) {
    return NextResponse.json(
      { error: normalizedSources.error },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  try {
    const calendar = getCalendarAdminClient();
    const googleCalendarId = await createGoogleCalendar(calendar, {
      name: name.trim(),
      timeZone: CALENDAR_TIME_ZONE,
      shareWithEmail: userEmail,
      isPublic,
    });

    if (isPublic) {
      await setGoogleCalendarPublic(calendar, googleCalendarId, true);
    }

    const created = await insertEventCalendar({
      name: name.trim(),
      googleCalendarId,
      isPublic,
      language: language || undefined,
      sources: normalizedSources.sources,
    });

    // Populate the new calendar straight away when it already has sources —
    // otherwise it sits empty until the user notices a Sync button.
    if (created.sources.length) startSync(created.id);

    return NextResponse.json({ calendar: created });
  } catch (error) {
    return serverError(error);
  }
}
