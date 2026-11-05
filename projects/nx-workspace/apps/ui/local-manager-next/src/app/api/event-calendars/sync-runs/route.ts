import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { getUserEmail } from '../../../../../libs/server-auth';
import { listSyncRuns } from '../../../../lib/event-calendars.db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SYNC_HISTORY_LIMIT = 10;

export async function GET(request: NextRequest) {
  const userEmail = await getUserEmail(request);
  if (!userEmail) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: HTTP_STATUS_CODES.UNAUTHORIZED },
    );
  }

  try {
    return NextResponse.json({ runs: await listSyncRuns(SYNC_HISTORY_LIMIT) });
  } catch (error) {
    console.error('[event-calendars] sync run lookup failed', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected error' },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}
