import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { getUserEmail } from '../../libs/server-auth';
import { listSyncRuns } from '../../libs/event-calendars.db';

const SYNC_HISTORY_LIMIT = 10;

export async function GET(request: Request) {
  const userEmail = await getUserEmail(request);
  if (!userEmail) {
    return Response.json(
      { error: 'Unauthorized' },
      { status: HTTP_STATUS_CODES.UNAUTHORIZED },
    );
  }

  try {
    return Response.json({ runs: await listSyncRuns(SYNC_HISTORY_LIMIT) });
  } catch (error) {
    console.error('[event-calendars] sync run lookup failed', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unexpected error' },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}
