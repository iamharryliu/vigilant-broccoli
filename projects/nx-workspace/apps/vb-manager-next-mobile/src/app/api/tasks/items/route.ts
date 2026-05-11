import { NextRequest, NextResponse } from 'next/server';
import {
  listTasks,
  isExpiredError,
  GOOGLE_TOKEN_EXPIRED,
} from '@vigilant-broccoli/google-workspace';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { googleToken, taskListId = '@default' } = body;
  if (!googleToken) {
    return NextResponse.json(
      { error: 'googleToken is required' },
      { status: 400 },
    );
  }

  try {
    const tasks = await listTasks(googleToken, taskListId);
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
