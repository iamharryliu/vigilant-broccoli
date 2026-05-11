import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
  isExpiredError,
} from '@vigilant-broccoli/google-workspace';

export const runtime = 'nodejs';

const getAccessToken = async (): Promise<string> => {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) throw new Error('Not authenticated');
  return session.accessToken as string;
};

export async function GET(req: NextRequest) {
  try {
    const accessToken = await getAccessToken();
    const taskListId = req.nextUrl.searchParams.get('taskListId') ?? '@default';
    const tasks = await listTasks(accessToken, taskListId);
    return NextResponse.json({ success: true, tasks });
  } catch (error) {
    if (isExpiredError(error)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch tasks',
      },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const accessToken = await getAccessToken();
    const body = await req.json();
    const task = await createTask(
      accessToken,
      body.taskListId ?? '@default',
      body.title,
    );
    return NextResponse.json({ success: true, task });
  } catch (error) {
    if (isExpiredError(error)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to create task',
      },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const accessToken = await getAccessToken();
    const taskListId = req.nextUrl.searchParams.get('taskListId') ?? '@default';
    const taskId = req.nextUrl.searchParams.get('taskId');
    if (!taskId) {
      return NextResponse.json(
        { error: 'taskId is required' },
        { status: 400 },
      );
    }
    await deleteTask(accessToken, taskListId, taskId);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (isExpiredError(error)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to delete task',
      },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const accessToken = await getAccessToken();
    const body = await req.json();
    const task = await updateTask(
      accessToken,
      body.taskListId ?? '@default',
      body.taskId,
      {
        title: body.title,
        notes: body.notes,
        due: body.due,
        status: body.status,
      },
    );
    return NextResponse.json({ success: true, task });
  } catch (error) {
    if (isExpiredError(error)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to update task',
      },
      { status: 500 },
    );
  }
}
