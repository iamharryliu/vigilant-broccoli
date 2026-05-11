import { NextRequest, NextResponse } from 'next/server';
import {
  createTasksClient,
  isExpiredError,
  GOOGLE_TOKEN_EXPIRED,
} from '../../../../../libs/google-tasks';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const googleToken = body.googleToken;
  if (!googleToken) {
    return NextResponse.json(
      { error: 'googleToken is required' },
      { status: 400 },
    );
  }

  try {
    const tasksClient = createTasksClient(googleToken);
    const response = await tasksClient.tasklists.list({ maxResults: 100 });
    const lists = (response.data.items ?? []).map(l => ({
      id: l.id,
      title: l.title,
    }));
    return NextResponse.json({ lists });
  } catch (error: unknown) {
    if (isExpiredError(error)) {
      return NextResponse.json(
        { error: GOOGLE_TOKEN_EXPIRED },
        { status: 401 },
      );
    }
    return NextResponse.json(
      { error: 'Failed to fetch task lists' },
      { status: 500 },
    );
  }
}
