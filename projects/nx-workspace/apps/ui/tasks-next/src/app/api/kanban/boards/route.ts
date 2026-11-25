import { createKanbanBoardsRouteHandlers } from '@vigilant-broccoli/react-lib-tasks/kanban-boards-server';
import { getUserEmail } from '../../../../../libs/server-auth';
import { supabaseAdmin } from '../../../../../libs/supabase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const STORE_PARAM = 'store';
// Local mode keeps its boards in the browser, so only these two reach the server.
const SERVER_STORES = ['google', 'database'];

export const { GET, PUT } = createKanbanBoardsRouteHandlers({
  getUserEmail,
  supabase: supabaseAdmin,
  resolveStore: request => {
    const store = new URL(request.url).searchParams.get(STORE_PARAM);
    return store && SERVER_STORES.includes(store) ? store : null;
  },
});
