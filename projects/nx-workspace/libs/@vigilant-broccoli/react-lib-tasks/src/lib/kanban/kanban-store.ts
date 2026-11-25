import { HTTP_HEADERS, HTTP_METHOD } from '@vigilant-broccoli/common-js';
import type { SortMode } from '../TaskChecklist';

export interface Lane {
  id: string;
  taskListId: string;
}

export interface Board {
  id: string;
  name: string;
  lanes: Lane[];
}

export interface KanbanState {
  boards: Board[];
  activeBoardId: string;
  sortModes: Record<string, SortMode>;
}

// A failed load must stay distinct from "no saved state yet": treating a
// transient auth or network error as empty would create and save a default
// board over the user's real boards.
export type KanbanLoadResult =
  { ok: true; state: KanbanState | null } | { ok: false };

// Where board setup (boards, lane order, per-list sort modes) is kept. The
// tasks themselves always come from the auth adapter's /api/tasks* routes.
export interface KanbanStore {
  load: () => Promise<KanbanLoadResult>;
  save: (state: KanbanState) => Promise<boolean>;
  // State saved by an older client-side store, copied into `save` when the
  // store has nothing yet and cleared once that succeeds.
  legacy?: { read: () => KanbanState | null; clear: () => void };
}

// A store backed by an app's board route (GET returns `{ state }`, PUT takes
// the state). Create it once at module level: a new store reloads the boards.
export const createRemoteKanbanStore = ({
  authFetch,
  url,
}: {
  authFetch: (input: string, init?: RequestInit) => Promise<Response>;
  url: string;
}): KanbanStore => ({
  load: async () => {
    const response = await authFetch(url);
    if (!response.ok) return { ok: false };
    const data = await response.json();
    return { ok: true, state: data.state ?? null };
  },
  save: async state => {
    const response = await authFetch(url, {
      method: HTTP_METHOD.PUT,
      headers: { ...HTTP_HEADERS.CONTENT_TYPE.JSON },
      body: JSON.stringify(state),
    });
    return response.ok;
  },
});
