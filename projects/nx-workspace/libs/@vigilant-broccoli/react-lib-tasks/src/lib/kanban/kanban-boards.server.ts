import type { SupabaseClient } from '@supabase/supabase-js';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';

const TABLE = 'app_kanban_boards';

// GET/PUT handlers for one user's board setup, one `app_kanban_boards` row per
// user and store. A store is one set of task list ids: Google's (shared by
// every app that reads the user's Google Tasks) or an app's database lists.
export const createKanbanBoardsRouteHandlers = ({
  getUserEmail,
  supabase,
  resolveStore,
}: {
  getUserEmail: (request: Request) => Promise<string | null>;
  // Needs the secret key: the table has RLS with no policies.
  supabase: SupabaseClient;
  // The request's store key, or null when it names none.
  resolveStore: (request: Request) => string | null;
}) => {
  const fail = (error: string, status: number) =>
    Response.json({ error }, { status });

  const resolve = async (request: Request) => {
    const userEmail = await getUserEmail(request);
    if (!userEmail) {
      return { error: fail('Unauthorized', HTTP_STATUS_CODES.UNAUTHORIZED) };
    }
    const store = resolveStore(request);
    if (!store) {
      return { error: fail('Invalid store', HTTP_STATUS_CODES.BAD_REQUEST) };
    }
    return { userEmail, store };
  };

  return {
    GET: async (request: Request) => {
      const resolved = await resolve(request);
      if (resolved.error) return resolved.error;
      const { data, error } = await supabase
        .from(TABLE)
        .select('state')
        .eq('user_email', resolved.userEmail)
        .eq('store', resolved.store)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return Response.json({ state: data?.state ?? null });
    },
    PUT: async (request: Request) => {
      const resolved = await resolve(request);
      if (resolved.error) return resolved.error;
      const { boards, activeBoardId, sortModes } = await request.json();
      const { error } = await supabase.from(TABLE).upsert({
        user_email: resolved.userEmail,
        store: resolved.store,
        state: { boards, activeBoardId, sortModes },
        updated_at: new Date().toISOString(),
      });
      if (error) throw new Error(error.message);
      return Response.json({ success: true });
    },
  };
};
