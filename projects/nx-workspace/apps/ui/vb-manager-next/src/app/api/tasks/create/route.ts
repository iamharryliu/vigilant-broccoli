import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { getGoogleAccessTokenForRequest } from '../../../../../libs/google-token';
import { createTask, isExpiredError } from '@vigilant-broccoli/google-workspace';

export const runtime = 'nodejs';

type TaskResult = {
  title: string;
  success: boolean;
  taskId?: string | null;
  error?: string;
};

export async function POST(req: NextRequest) {
  let accessToken: string;
  try {
    accessToken = await getGoogleAccessTokenForRequest(req);
  } catch {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: HTTP_STATUS_CODES.UNAUTHORIZED },
    );
  }

  const { items, taskListId } = (await req.json()) as {
    items: string[];
    taskListId: string;
  };

  const results: TaskResult[] = [];
  for (const title of items) {
    try {
      const task = await createTask(accessToken, taskListId, title);
      results.push({ title, success: true, taskId: task.id });
    } catch (error) {
      if (isExpiredError(error)) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: HTTP_STATUS_CODES.UNAUTHORIZED },
        );
      }
      const message =
        (error as { message?: string })?.message ?? 'Unknown error';
      results.push({ title, success: false, error: message });
    }
  }

  return NextResponse.json({ results });
}
