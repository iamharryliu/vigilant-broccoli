import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  updateTask,
  isExpiredError,
  GOOGLE_TOKEN_EXPIRED,
} from '@vigilant-broccoli/google-workspace';

export const runtime = 'nodejs';

const RequestSchema = z.object({
  googleToken: z.string().min(1),
  taskListId: z.string().default('@default'),
  taskId: z.string().min(1),
  title: z.string().optional(),
  status: z.enum(['needsAction', 'completed']).optional(),
});

export async function POST(request: NextRequest) {
  const parsed = RequestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { googleToken, taskListId, taskId, title, status } = parsed.data;

  try {
    const task = await updateTask(googleToken, taskListId, taskId, {
      title,
      status,
    });
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
