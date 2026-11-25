import { createKanbanBoardsRouteHandlers } from '@vigilant-broccoli/react-lib-tasks/kanban-boards-server';
import { getUserEmail } from '../../../../../libs/server-auth';
import { supabaseAdmin } from '../../../../lib/supabase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// This app reads the user's Google Tasks lists, so its boards are the `google`
// store, the same row tasks-next's Google mode uses.
const GOOGLE_STORE = 'google';

export const { GET, PUT } = createKanbanBoardsRouteHandlers({
  getUserEmail,
  supabase: supabaseAdmin,
  resolveStore: () => GOOGLE_STORE,
});
