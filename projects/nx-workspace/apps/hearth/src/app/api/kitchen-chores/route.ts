import { createChecklistHandlers } from '../../../lib/checklist-route';

export const runtime = 'nodejs';

const handlers = createChecklistHandlers('kitchen_chore_items');

export const GET = handlers.GET;
export const POST = handlers.POST;
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
