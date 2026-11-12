import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import {
  createTask,
  deleteTask,
  listTasks,
  reorderTasks,
  updateTask,
} from '../../../lib/tasks.db';

const ID_PARAM = 'id';

const badRequest = () =>
  NextResponse.json(
    { error: 'Invalid task' },
    { status: HTTP_STATUS_CODES.BAD_REQUEST },
  );

const readTitle = (value: unknown) =>
  typeof value === 'string' && value.trim() ? value.trim() : null;

export async function GET() {
  return NextResponse.json({ tasks: listTasks() });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const title = readTitle(body?.title);
  if (!title) return badRequest();
  return NextResponse.json({ task: createTask(title) });
}

// Without `id`, `order` lists task ids in their new display order. With one,
// updates the title and/or checked state of that task.
export async function PATCH(req: NextRequest) {
  const id = req.nextUrl.searchParams.get(ID_PARAM);
  const body = await req.json().catch(() => null);
  if (!id && Array.isArray(body?.order)) {
    if (!body.order.every((value: unknown) => typeof value === 'string')) {
      return badRequest();
    }
    reorderTasks(body.order);
    return NextResponse.json({ ok: true });
  }
  const title = body?.title === undefined ? undefined : readTitle(body.title);
  const checked = body?.checked;
  if (
    !id ||
    title === null ||
    (checked !== undefined && typeof checked !== 'boolean')
  ) {
    return badRequest();
  }
  if (!updateTask(id, { title, checked })) {
    return NextResponse.json(
      { error: 'Task not found' },
      { status: HTTP_STATUS_CODES.INVALID_PATH },
    );
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get(ID_PARAM);
  if (!id) return badRequest();
  deleteTask(id);
  return NextResponse.json({ ok: true });
}
