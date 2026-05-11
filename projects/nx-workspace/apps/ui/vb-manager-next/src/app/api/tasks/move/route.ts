import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { moveTask, isExpiredError } from '@vigilant-broccoli/google-workspace';

export const runtime = 'nodejs';

const getAccessToken = async (): Promise<string> => {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) throw new Error('Not authenticated');
  return session.accessToken as string;
};

export async function POST(req: NextRequest) {
  try {
    const accessToken = await getAccessToken();
    const body = await req.json();
    const { taskListId = '@default', taskId, previous } = body;

    if (!taskId) {
      return NextResponse.json(
        { error: 'taskId is required' },
        { status: 400 },
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to move task' },
      { status: 500 },
    );
  }
}
