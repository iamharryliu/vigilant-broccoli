import type { SupabaseClient } from '@supabase/supabase-js';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import type { NotepadDocument, NotepadSaveRequest } from './notepad.types';

const NOTEPAD_COLUMNS = 'content, yjs_state, updated_at';
const UPDATED_AT_COLUMN = 'updated_at';

interface NotepadRow {
  content: string | null;
  yjs_state: string | null;
  updated_at: string | null;
}

interface NotepadValues {
  content: string;
  yjs_state: string | null;
  updated_at: string;
}

export interface NotepadStore {
  // The caller's client decides authorization: an RLS user client (hearth) or
  // the admin client behind the route's own auth check (manager apps).
  client: SupabaseClient;
  table: string;
  // Column values identifying the notepad's single row.
  match: Record<string, string | number>;
  // Unique constraint to upsert on for a save without `baseUpdatedAt`, the
  // first save of a board whose row doesn't exist yet. Without it, such a save
  // gets a 409 with the current row, like any other stale base.
  upsertOnConflict?: string;
}

const toDocument = (row: NotepadRow | null): NotepadDocument => ({
  content: row?.content ?? '',
  yjsState: row?.yjs_state ?? null,
  updatedAt: row?.updated_at ?? null,
});

const internalError = (message: string) =>
  Response.json(
    { error: message },
    { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
  );

const conflict = (row: NotepadRow | null) =>
  Response.json(toDocument(row), { status: HTTP_STATUS_CODES.CONFLICT });

const fetchRow = ({ client, table, match }: NotepadStore) =>
  client
    .from(table)
    .select(NOTEPAD_COLUMNS)
    .match(match)
    .maybeSingle<NotepadRow>();

const conflictWithLatest = async (store: NotepadStore) => {
  const { data, error } = await fetchRow(store);
  if (error) return internalError(error.message);
  return conflict(data);
};

// Clients only flag an empty write when an edit (theirs or a peer's) emptied
// the board, and only a write based on the current row may clear it; anything
// else (fresh tab, failed load, reset room) gets the saved text back as a 409.
const refuseEmptyOverwrite = async (store: NotepadStore) => {
  const { data, error } = await fetchRow(store);
  if (error) return internalError(error.message);
  return data?.content ? conflict(data) : null;
};

const saveWithoutBase = async (store: NotepadStore, values: NotepadValues) => {
  const { client, table, match, upsertOnConflict } = store;
  if (!upsertOnConflict) return conflictWithLatest(store);
  const { data, error } = await client
    .from(table)
    .upsert({ ...match, ...values }, { onConflict: upsertOnConflict })
    .select(NOTEPAD_COLUMNS)
    .single<NotepadRow>();
  if (error) return internalError(error.message);
  return Response.json(toDocument(data));
};

const updateFromBase = async (
  store: NotepadStore,
  values: NotepadValues,
  baseUpdatedAt: string,
) => {
  const { data, error } = await store.client
    .from(store.table)
    .update(values)
    .match(store.match)
    .eq(UPDATED_AT_COLUMN, baseUpdatedAt)
    .select(NOTEPAD_COLUMNS);
  if (error) return internalError(error.message);
  if (!data || data.length === 0) return conflictWithLatest(store);
  return Response.json(toDocument(data[0]));
};

export const getNotepad = async (store: NotepadStore): Promise<Response> => {
  const { data, error } = await fetchRow(store);
  if (error) return internalError(error.message);
  return Response.json(toDocument(data));
};

export const saveNotepad = async (
  store: NotepadStore,
  request: Request,
): Promise<Response> => {
  const { content, yjsState, baseUpdatedAt, allowEmpty }: NotepadSaveRequest =
    await request.json();
  const text = content ?? '';
  // A client without Yjs state (one loaded before this field existed) still
  // overwrites the text, so the stored state is cleared rather than left
  // describing older text.
  const values: NotepadValues = {
    content: text,
    yjs_state: yjsState ?? null,
    updated_at: new Date().toISOString(),
  };

  if (!text && !(allowEmpty && baseUpdatedAt)) {
    const refusal = await refuseEmptyOverwrite(store);
    if (refusal) return refusal;
  }

  return baseUpdatedAt
    ? updateFromBase(store, values, baseUpdatedAt)
    : saveWithoutBase(store, values);
};
