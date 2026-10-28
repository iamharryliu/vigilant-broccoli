import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { getUserEmail } from '../../../../../libs/server-auth';
import { getKanbanState, saveKanbanState, KanbanState } from '../db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const userEmail = await getUserEmail(request);
  if (!userEmail) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: HTTP_STATUS_CODES.UNAUTHORIZED },
    );
  }
  const state = await getKanbanState(userEmail);
  return NextResponse.json({ state });
}

export async function PUT(request: NextRequest) {
  const userEmail = await getUserEmail(request);
  if (!userEmail) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: HTTP_STATUS_CODES.UNAUTHORIZED },
    );
  }
  const { boards, activeBoardId, sortModes } =
    (await request.json()) as KanbanState;
  await saveKanbanState(userEmail, { boards, activeBoardId, sortModes });
  return NextResponse.json({ success: true });
}
