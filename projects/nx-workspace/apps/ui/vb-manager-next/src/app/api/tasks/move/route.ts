import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';

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

export async function POST(req: NextRequest) {
  try {
    const tasks = await getAuthenticatedTasksClient();
    const body = await req.json();
    const { taskListId = '@default', taskId, previous } = body;

    if (!taskId) {
      return NextResponse.json(
        { error: 'taskId is required' },
        { status: 400 },
      );
    }

    const response = await tasks.tasks.move({
      tasklist: taskListId,
      task: taskId,
      previous: previous || undefined,
    });

    return NextResponse.json({
      success: true,
      task: response.data,
    });
  } catch (error) {
    console.error('Error moving task:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to move task' },
      { status: 500 },
    );
  }
}
