import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { getUserEmail } from '../../libs/server-auth';
import { getKanbanState, saveKanbanState, KanbanState } from './db';

export async function GET(request: Request) {
  const userEmail = await getUserEmail(request);
  if (!userEmail) {
    return Response.json(
      { error: 'Unauthorized' },
      { status: HTTP_STATUS_CODES.UNAUTHORIZED },
    );
  }
  const state = await getKanbanState(userEmail);
  return Response.json({ state });
}

export async function PUT(request: Request) {
  const userEmail = await getUserEmail(request);
  if (!userEmail) {
    return Response.json(
      { error: 'Unauthorized' },
      { status: HTTP_STATUS_CODES.UNAUTHORIZED },
    );
  }
  const { boards, activeBoardId, sortModes } =
    (await request.json()) as KanbanState;
  await saveKanbanState(userEmail, { boards, activeBoardId, sortModes });
  return Response.json({ success: true });
}
