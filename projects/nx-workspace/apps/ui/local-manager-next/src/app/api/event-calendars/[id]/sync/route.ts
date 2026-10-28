import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { getUserEmail } from '../../../../../../libs/server-auth';
import { getEventCalendar } from '../../../../../lib/event-calendars.db';
import {
  getSyncStatus,
  startSync,
} from '../../../../../lib/event-scraper/sync-runner';

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

export async function POST(request: NextRequest, { params }: RouteContext) {
  const userEmail = await getUserEmail(request);
  if (!userEmail) return unauthorized();

  const { id } = await params;
  if (!(await getEventCalendar(id))) return notFound();

  return NextResponse.json({ status: startSync(id) });
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const userEmail = await getUserEmail(request);
  if (!userEmail) return unauthorized();

  const { id } = await params;
  const calendar = await getEventCalendar(id);
  if (!calendar) return notFound();

  return NextResponse.json({
    status: getSyncStatus(id),
    lastSyncedAt: calendar.lastSyncedAt,
    lastSyncMessage: calendar.lastSyncMessage,
  });
}
