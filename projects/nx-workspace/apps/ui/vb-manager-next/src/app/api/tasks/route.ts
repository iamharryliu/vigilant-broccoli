import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';

const getAuthenticatedTasksClient = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    throw new Error('Not authenticated');
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: session.accessToken,
  });

  return google.tasks({ version: 'v1', auth: oauth2Client });
};

export async function GET(req: NextRequest) {
  try {
    const tasks = await getAuthenticatedTasksClient();
    const taskListId = req.nextUrl.searchParams.get('taskListId') || '@default';

    const response = await tasks.tasks.list({
      tasklist: taskListId,
      showCompleted: false,
      maxResults: 10,
    });

    return NextResponse.json({
      success: true,
      tasks: response.data.items || [],
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const tasks = await getAuthenticatedTasksClient();
    const body = await req.json();
    const taskListId = body.taskListId || '@default';

    const response = await tasks.tasks.insert({
      tasklist: taskListId,
      requestBody: {
        title: body.title,
        notes: body.notes,
        due: body.due,
      },
    });

    return NextResponse.json({
      success: true,
      task: response.data,
    });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create task' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const tasks = await getAuthenticatedTasksClient();
    const body = await req.json();
    const taskListId = body.taskListId || '@default';

    const response = await tasks.tasks.patch({
      tasklist: taskListId,
      task: body.taskId,
      requestBody: {
        title: body.title,
        notes: body.notes,
        due: body.due,
        status: body.status,
      },
    });

    return NextResponse.json({
      success: true,
      task: response.data,
    });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update task' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const tasks = await getAuthenticatedTasksClient();
    const taskListId = req.nextUrl.searchParams.get('taskListId') || '@default';
    const taskId = req.nextUrl.searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json(
        { error: 'taskId is required' },
        { status: 400 }
      );
    }

    await tasks.tasks.delete({
      tasklist: taskListId,
      task: taskId,
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete task' },
      { status: 500 }
    );
  }
}
