import { NextRequest, NextResponse } from 'next/server';
import {
  moveTask,
  isExpiredError,
  GOOGLE_TOKEN_EXPIRED,
} from '@vigilant-broccoli/google-workspace';
import { requireGoogleAuth } from '../../../../../libs/api-auth';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const auth = await requireGoogleAuth(req);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  const { taskListId = '@default', taskId, previous } = body;

  if (!taskId) {
    return NextResponse.json({ error: 'taskId is required' }, { status: 400 });
  }

  try {
    const task = await moveTask(
      auth.googleToken,
      taskListId,
      taskId,
      previous ?? null,
    );
    return NextResponse.json({ task });
  } catch (error) {
    if (isExpiredError(error)) {
      return NextResponse.json(
        { error: GOOGLE_TOKEN_EXPIRED },
        { status: 401 },
      );
    }
    return NextResponse.json({ error: 'Failed to move task' }, { status: 500 });
  }
}
