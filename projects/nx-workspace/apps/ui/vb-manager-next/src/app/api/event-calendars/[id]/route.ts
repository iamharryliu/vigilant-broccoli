import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { getUserEmail } from '../../../../../libs/server-auth';
import {
  deleteEventCalendar,
  getEventCalendar,
  updateEventCalendar,
} from '../../../../lib/event-calendars.db';
import {
  deleteGoogleCalendar,
  getCalendarAdminClient,
  renameGoogleCalendar,
  setGoogleCalendarPublic,
} from '../../../../lib/google-calendar-admin';
import { normalizeSources } from '../sources';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ id: string }> };

const unauthorized = () =>
  NextResponse.json(
    { error: 'Unauthorized' },
    { status: HTTP_STATUS_CODES.UNAUTHORIZED },
  );

const notFound = () =>
  NextResponse.json(
    { error: 'Calendar not found' },
    { status: HTTP_STATUS_CODES.INVALID_PATH },
  );

const serverError = (error: unknown) => {
  console.error('[event-calendars]', error);
  return NextResponse.json(
    { error: error instanceof Error ? error.message : 'Unexpected error' },
    { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
  );
};

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const userEmail = await getUserEmail(request);
  if (!userEmail) return unauthorized();

  const { id } = await params;
  const existing = await getEventCalendar(id);
  if (!existing) return notFound();

  const { name, isPublic, sources } = await request.json();

  try {
    const calendar = getCalendarAdminClient();

    if (name && name.trim() !== existing.name) {
      await renameGoogleCalendar(
        calendar,
        existing.googleCalendarId,
        name.trim(),
      );
    }

    if (isPublic !== undefined && isPublic !== existing.isPublic) {
      await setGoogleCalendarPublic(
        calendar,
        existing.googleCalendarId,
        isPublic,
      );
    }

    return NextResponse.json({
      calendar: await updateEventCalendar(id, {
        name: name?.trim(),
        isPublic,
        sources: sources ? normalizeSources(sources) : undefined,
      }),
    });
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const userEmail = await getUserEmail(request);
  if (!userEmail) return unauthorized();

  const { id } = await params;
  const existing = await getEventCalendar(id);
  if (!existing) return notFound();

  try {
    await deleteGoogleCalendar(
      getCalendarAdminClient(),
      existing.googleCalendarId,
    );
    await deleteEventCalendar(id);
    return new NextResponse(null, { status: HTTP_STATUS_CODES.NO_CONTENT });
  } catch (error) {
    return serverError(error);
  }
}
