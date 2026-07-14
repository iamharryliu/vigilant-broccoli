import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { getGoogleAccessToken } from '../../../../../libs/server-auth';
import { moveTask, isExpiredError } from '@vigilant-broccoli/google-workspace';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const accessToken = getGoogleAccessToken(req);
    const body = await req.json();
    const { taskListId = '@default', taskId, previous } = body;

    if (!taskId) {
      return NextResponse.json(
        { error: 'taskId is required' },
        { status: HTTP_STATUS_CODES.BAD_REQUEST },
      );
    }

    const task = await moveTask(
      accessToken,
      taskListId,
      taskId,
      previous ?? null,
    );
    return NextResponse.json({ success: true, task });
  } catch (error) {
    if (isExpiredError(error)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: HTTP_STATUS_CODES.UNAUTHORIZED },
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to move task' },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}
