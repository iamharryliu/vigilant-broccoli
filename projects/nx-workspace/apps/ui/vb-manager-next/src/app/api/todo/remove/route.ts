import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import {
  dispatchTodoRemoval,
  isTodoId,
  normalizeRemovalReason,
} from '../_lib/todo-dispatch';
import { MAX_TODO_REMOVAL_REASON_LENGTH } from '../../../constants/todo';

export async function POST(request: NextRequest) {
  const { id, reason } = await request.json();
  const normalizedReason = normalizeRemovalReason(reason);

  if (!isTodoId(id)) {
    return NextResponse.json(
      { error: 'Invalid TODO id' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }
  if (
    !normalizedReason ||
    normalizedReason.length > MAX_TODO_REMOVAL_REASON_LENGTH
  ) {
    return NextResponse.json(
      {
        error: `A removal reason of 1-${MAX_TODO_REMOVAL_REASON_LENGTH} characters is required`,
      },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  await dispatchTodoRemoval(id, normalizedReason);

  return NextResponse.json({ success: true });
}
