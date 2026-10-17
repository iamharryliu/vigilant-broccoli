import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { getGoogleAccessTokenForRequest } from '../../libs/google-token';
import {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
  isExpiredError,
} from '@vigilant-broccoli/google-workspace';

export async function GET(req: Request) {
  try {
    const accessToken = await getGoogleAccessTokenForRequest(req);
    const taskListId =
      new URL(req.url).searchParams.get('taskListId') ?? '@default';
    const tasks = await listTasks(accessToken, taskListId, true);
    return Response.json({ success: true, tasks });
  } catch (error) {
    if (isExpiredError(error)) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: HTTP_STATUS_CODES.UNAUTHORIZED },
      );
    }
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch tasks',
      },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}

export async function POST(req: Request) {
  try {
    const accessToken = await getGoogleAccessTokenForRequest(req);
    const body = await req.json();
    const task = await createTask(
      accessToken,
      body.taskListId ?? '@default',
      body.title,
    );
    return Response.json({ success: true, task });
  } catch (error) {
    if (isExpiredError(error)) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: HTTP_STATUS_CODES.UNAUTHORIZED },
      );
    }
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Failed to create task',
      },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const accessToken = await getGoogleAccessTokenForRequest(req);
    const taskListId =
      new URL(req.url).searchParams.get('taskListId') ?? '@default';
    const taskId = new URL(req.url).searchParams.get('taskId');
    if (!taskId) {
      return Response.json(
        { error: 'taskId is required' },
        { status: HTTP_STATUS_CODES.BAD_REQUEST },
      );
    }
    await deleteTask(accessToken, taskListId, taskId);
    return Response.json({ success: true });
  } catch (error) {
    if (isExpiredError(error)) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: HTTP_STATUS_CODES.UNAUTHORIZED },
      );
    }
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Failed to delete task',
      },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const accessToken = await getGoogleAccessTokenForRequest(req);
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
    return Response.json({ success: true, task });
  } catch (error) {
    if (isExpiredError(error)) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: HTTP_STATUS_CODES.UNAUTHORIZED },
      );
    }
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Failed to update task',
      },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}
