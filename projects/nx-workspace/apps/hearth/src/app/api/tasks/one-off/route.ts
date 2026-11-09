import { createChecklistHandlers } from '../../../../lib/checklist-route';
import { ONE_OFF_TASKS_TABLE } from '../../../../lib/tasks-route';

export const runtime = 'nodejs';

const handlers = createChecklistHandlers(ONE_OFF_TASKS_TABLE, {
  assignable: true,
});

export const GET = handlers.GET;
export const POST = handlers.POST;
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
