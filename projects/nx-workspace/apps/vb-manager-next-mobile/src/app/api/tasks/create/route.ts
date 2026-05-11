import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  createTasksClient,
  isExpiredError,
  GOOGLE_TOKEN_EXPIRED,
} from '../../../../../libs/google-tasks';

export const runtime = 'nodejs';

const RequestSchema = z.object({
  items: z.array(z.string()).min(1),
  googleToken: z.string().min(1),
  taskListId: z.string().min(1),
});

type TaskResult = {
  title: string;
  success: boolean;
  taskId?: string | null;
  error?: string;
};

export async function POST(request: NextRequest) {
  const parsed = RequestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { items, googleToken, taskListId } = parsed.data;
  const tasksClient = createTasksClient(googleToken);
  const results: TaskResult[] = [];

  for (const title of items) {
    try {
      const res = await tasksClient.tasks.insert({
        tasklist: taskListId,
        requestBody: { title },
      });
      results.push({ title, success: true, taskId: res.data.id });
    } catch (err: unknown) {
      if (isExpiredError(err)) {
        return NextResponse.json(
          { error: GOOGLE_TOKEN_EXPIRED },
          { status: 401 },
        );
      }
      const message = (err as { message?: string })?.message ?? 'Unknown error';
      results.push({ title, success: false, error: message });
    }
  }

  return NextResponse.json({ results });
}
