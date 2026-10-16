import { NextRequest, NextResponse } from 'next/server';
import {
  listTasks,
  createTask,
  updateTask,
  isExpiredError,
  GOOGLE_TOKEN_EXPIRED,
} from '@vigilant-broccoli/google-workspace';
import { requireAuth } from '../../../../libs/api-auth';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req, { requireGoogleToken: true });
  if (auth instanceof NextResponse) return auth;

  const taskListId = req.nextUrl.searchParams.get('taskListId') ?? '@default';

  try {
    const tasks = await listTasks(auth.googleToken as string, taskListId, true);
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

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, { requireGoogleToken: true });
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();

  try {
    const task = await createTask(
      auth.googleToken as string,
      body.taskListId ?? '@default',
      body.title,
    );
    return NextResponse.json({ task });
  } catch (error) {
    if (isExpiredError(error)) {
      return NextResponse.json(
        { error: GOOGLE_TOKEN_EXPIRED },
        { status: 401 },
      );
    }
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAuth(req, { requireGoogleToken: true });
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();

  try {
    const task = await updateTask(
      auth.googleToken as string,
      body.taskListId ?? '@default',
      body.taskId,
      {
        title: body.title,
        notes: body.notes,
        due: body.due,
        status: body.status,
      },
    );
    return NextResponse.json({ task });
  } catch (error) {
    if (isExpiredError(error)) {
      return NextResponse.json(
        { error: GOOGLE_TOKEN_EXPIRED },
        { status: 401 },
      );
    }
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 },
    );
  }
}
