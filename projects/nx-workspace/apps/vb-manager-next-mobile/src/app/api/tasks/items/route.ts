import { NextRequest, NextResponse } from 'next/server';
import {
  listTasks,
  isExpiredError,
  GOOGLE_TOKEN_EXPIRED,
} from '@vigilant-broccoli/google-workspace';
import { requireAuth } from '../../../../../libs/api-auth';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request, { requireGoogleToken: true });
  if (auth instanceof NextResponse) return auth;

  const body = await request.json();
  const taskListId = body.taskListId ?? '@default';

  try {
    const tasks = await listTasks(auth.googleToken as string, taskListId);
    return NextResponse.json({ tasks });
  } catch (error) {
    if (isExpiredError(error)) {
      return NextResponse.json(
        { error: GOOGLE_TOKEN_EXPIRED },
        { status: 401 },
      );
    }
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 },
    );
  }
}
