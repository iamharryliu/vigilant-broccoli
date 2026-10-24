import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { dispatchTodoSolve, isTodoId } from '../_lib/todo-dispatch';

export async function POST(request: NextRequest) {
  const { id } = await request.json();

  if (!isTodoId(id)) {
    return NextResponse.json(
      { error: 'Invalid TODO id' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  await dispatchTodoSolve(id);

  return NextResponse.json({ success: true });
}
