import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { getKanbanState, saveKanbanState, KanbanState } from '../db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const getUserEmail = async (): Promise<string | null> => {
  const session = await getServerSession(authOptions);
  return session?.userEmail ?? session?.user?.email ?? null;
};

export async function GET() {
  const userEmail = await getUserEmail();
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
  const userEmail = await getUserEmail();
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
