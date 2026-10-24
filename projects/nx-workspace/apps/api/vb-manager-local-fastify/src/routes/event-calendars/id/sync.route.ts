import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { getUserEmail } from '../../../libs/server-auth';
import { getEventCalendar } from '../../../libs/event-calendars.db';
import {
  getSyncStatus,
  startSync,
} from '../../../libs/event-scraper/sync-runner';

type RouteContext = { params: { id: string } };

const unauthorized = () =>
  Response.json(
    { error: 'Unauthorized' },
    { status: HTTP_STATUS_CODES.UNAUTHORIZED },
  );

const notFound = () =>
  Response.json(
    { error: 'Calendar not found' },
    { status: HTTP_STATUS_CODES.INVALID_PATH },
  );

export async function POST(request: Request, { params }: RouteContext) {
  const userEmail = await getUserEmail(request);
  if (!userEmail) return unauthorized();

  const { id } = params;
  if (!(await getEventCalendar(id))) return notFound();

  return Response.json({ status: startSync(id) });
}

export async function GET(request: Request, { params }: RouteContext) {
  const userEmail = await getUserEmail(request);
  if (!userEmail) return unauthorized();

  const { id } = params;
  const calendar = await getEventCalendar(id);
  if (!calendar) return notFound();

  return Response.json({
    status: getSyncStatus(id),
    lastSyncedAt: calendar.lastSyncedAt,
    lastSyncMessage: calendar.lastSyncMessage,
  });
}
