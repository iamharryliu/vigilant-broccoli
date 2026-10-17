import { randomUUID } from 'crypto';
import { supabaseAdmin } from './supabase-admin';
import {
  EventCalendar,
  EventCalendarSource,
  EventSourceType,
  SYNC_RUN_STATUS,
  SyncRun,
  SyncRunResult,
  SyncRunStatus,
  SyncRunTrigger,
} from '@vigilant-broccoli/vb-manager-local-common';

// Tracking lives in shared Supabase (not per-machine SQLite) so every machine
// reads the same list; see the create_event_calendars migration.
const CALENDARS_TABLE = 'event_calendars';
const SOURCES_TABLE = 'event_calendar_sources';
const SYNC_RUNS_TABLE = 'event_calendar_sync_runs';
const MINUTE_MS = 60_000;
const DAY_MS = 24 * 60 * MINUTE_MS;
// The runner heartbeats far more often than this (sync-runner.ts), so a
// running row this quiet belongs to a process that died mid-run.
const SYNC_RUN_STALE_MS = 30 * MINUTE_MS;
const SYNC_RUN_RETENTION_MS = 30 * DAY_MS;

interface EventCalendarRow {
  id: string;
  name: string;
  google_calendar_id: string;
  is_public: boolean;
  language: string | null;
  created_at: string;
  updated_at: string;
  last_synced_at: string | null;
  last_sync_message: string | null;
}

interface EventCalendarSourceRow {
  calendar_id: string;
  url: string;
  source_type: string;
}

interface SyncRunResultRow {
  calendar_id: string;
  ok: boolean;
  message: string;
}

interface SyncRunRow {
  id: string;
  trigger: SyncRunTrigger;
  status: SyncRunStatus;
  started_at: string;
  finished_at: string | null;
  updated_at: string;
  current_calendar_id: string | null;
  results: SyncRunResultRow[];
}

const unwrap = <T>({ data, error }: { data: T; error: unknown }): T => {
  if (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : ((error as { message?: string })?.message ?? 'Supabase error'),
    );
  }
  return data;
};

const toEventCalendar = (
  row: EventCalendarRow,
  sources: EventCalendarSource[],
): EventCalendar => ({
  id: row.id,
  name: row.name,
  googleCalendarId: row.google_calendar_id,
  isPublic: row.is_public,
  language: row.language ?? undefined,
  sources,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  lastSyncedAt: row.last_synced_at ?? undefined,
  lastSyncMessage: row.last_sync_message ?? undefined,
});

const groupSources = (
  rows: EventCalendarSourceRow[],
): Map<string, EventCalendarSource[]> =>
  rows.reduce((grouped, row) => {
    const sources = grouped.get(row.calendar_id) ?? [];
    sources.push({
      url: row.url,
      sourceType: row.source_type as EventSourceType,
    });
    grouped.set(row.calendar_id, sources);
    return grouped;
  }, new Map<string, EventCalendarSource[]>());

const replaceSources = async (
  calendarId: string,
  sources: EventCalendarSource[],
) => {
  unwrap(
    await supabaseAdmin
      .from(SOURCES_TABLE)
      .delete()
      .eq('calendar_id', calendarId),
  );
  if (!sources.length) return;
  unwrap(
    await supabaseAdmin.from(SOURCES_TABLE).insert(
      sources.map(source => ({
        calendar_id: calendarId,
        url: source.url,
        source_type: source.sourceType,
      })),
    ),
  );
};

export const listEventCalendars = async (): Promise<EventCalendar[]> => {
  const rows = unwrap(
    await supabaseAdmin.from(CALENDARS_TABLE).select('*').order('created_at'),
  ) as EventCalendarRow[];
  const sourceRows = unwrap(
    await supabaseAdmin
      .from(SOURCES_TABLE)
      .select('calendar_id, url, source_type'),
  ) as EventCalendarSourceRow[];
  const sourcesByCalendarId = groupSources(sourceRows);
  return rows.map(row =>
    toEventCalendar(row, sourcesByCalendarId.get(row.id) ?? []),
  );
};

export const getEventCalendar = async (
  id: string,
): Promise<EventCalendar | null> => {
  const row = unwrap(
    await supabaseAdmin
      .from(CALENDARS_TABLE)
      .select('*')
      .eq('id', id)
      .maybeSingle(),
  ) as EventCalendarRow | null;
  if (!row) return null;

  const sourceRows = unwrap(
    await supabaseAdmin
      .from(SOURCES_TABLE)
      .select('calendar_id, url, source_type')
      .eq('calendar_id', id),
  ) as EventCalendarSourceRow[];

  return toEventCalendar(
    row,
    sourceRows.map(source => ({
      url: source.url,
      sourceType: source.source_type as EventSourceType,
    })),
  );
};

export const insertEventCalendar = async ({
  name,
  googleCalendarId,
  isPublic,
  language,
  sources,
}: {
  name: string;
  googleCalendarId: string;
  isPublic: boolean;
  language?: string;
  sources: EventCalendarSource[];
}): Promise<EventCalendar> => {
  const id = randomUUID();
  const now = new Date().toISOString();

  unwrap(
    await supabaseAdmin.from(CALENDARS_TABLE).insert({
      id,
      name,
      google_calendar_id: googleCalendarId,
      is_public: isPublic,
      ...(language && { language }),
      created_at: now,
      updated_at: now,
    }),
  );

  await replaceSources(id, sources);

  return {
    id,
    name,
    googleCalendarId,
    isPublic,
    language,
    sources,
    createdAt: now,
    updatedAt: now,
  };
};

export const updateEventCalendar = async (
  id: string,
  updates: {
    name?: string;
    isPublic?: boolean;
    language?: string;
    sources?: EventCalendarSource[];
  },
): Promise<EventCalendar | null> => {
  const existing = await getEventCalendar(id);
  if (!existing) return null;

  unwrap(
    await supabaseAdmin
      .from(CALENDARS_TABLE)
      .update({
        name: updates.name ?? existing.name,
        is_public: updates.isPublic ?? existing.isPublic,
        ...(updates.language !== undefined &&
          (updates.language || undefined) !== existing.language && {
            language: updates.language || null,
          }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id),
  );

  if (updates.sources) await replaceSources(id, updates.sources);

  return getEventCalendar(id);
};

export const deleteEventCalendar = async (id: string) => {
  // event_calendar_sources cascades via its foreign key.
  unwrap(await supabaseAdmin.from(CALENDARS_TABLE).delete().eq('id', id));
};

export const recordSyncResult = async (id: string, message: string) => {
  unwrap(
    await supabaseAdmin
      .from(CALENDARS_TABLE)
      .update({
        last_synced_at: new Date().toISOString(),
        last_sync_message: message,
      })
      .eq('id', id),
  );
};

const toSyncRunResultRows = (results: SyncRunResult[]): SyncRunResultRow[] =>
  results.map(({ calendarId, ok, message }) => ({
    calendar_id: calendarId,
    ok,
    message,
  }));

const toSyncRun = (row: SyncRunRow, now: number): SyncRun => {
  const stale =
    row.status === SYNC_RUN_STATUS.RUNNING &&
    now - new Date(row.updated_at).getTime() > SYNC_RUN_STALE_MS;
  return {
    id: row.id,
    trigger: row.trigger,
    status: stale ? SYNC_RUN_STATUS.FAILED : row.status,
    stale,
    startedAt: row.started_at,
    finishedAt: row.finished_at ?? undefined,
    currentCalendarId: stale
      ? undefined
      : (row.current_calendar_id ?? undefined),
    results: row.results.map(result => ({
      calendarId: result.calendar_id,
      ok: result.ok,
      message: result.message,
    })),
  };
};

export const startSyncRun = async (trigger: SyncRunTrigger) => {
  const row = unwrap(
    await supabaseAdmin
      .from(SYNC_RUNS_TABLE)
      .insert({ trigger, status: SYNC_RUN_STATUS.RUNNING })
      .select('id')
      .single(),
  ) as { id: string };
  return row.id;
};

// Also the run's heartbeat: every call bumps updated_at.
export const updateSyncRun = async (
  id: string,
  {
    currentCalendarId,
    results,
  }: { currentCalendarId?: string; results?: SyncRunResult[] } = {},
) => {
  unwrap(
    await supabaseAdmin
      .from(SYNC_RUNS_TABLE)
      .update({
        updated_at: new Date().toISOString(),
        ...(currentCalendarId !== undefined && {
          current_calendar_id: currentCalendarId,
        }),
        ...(results && { results: toSyncRunResultRows(results) }),
      })
      .eq('id', id),
  );
};

export const finishSyncRun = async (
  id: string,
  status: SyncRunStatus,
  results: SyncRunResult[],
) => {
  const now = new Date().toISOString();
  unwrap(
    await supabaseAdmin
      .from(SYNC_RUNS_TABLE)
      .update({
        status,
        results: toSyncRunResultRows(results),
        finished_at: now,
        updated_at: now,
        current_calendar_id: null,
      })
      .eq('id', id),
  );
};

export const listSyncRuns = async (limit: number): Promise<SyncRun[]> => {
  const rows = unwrap(
    await supabaseAdmin
      .from(SYNC_RUNS_TABLE)
      .select('*')
      .order('started_at', { ascending: false })
      .limit(limit),
  ) as SyncRunRow[];
  const now = Date.now();
  return rows.map(row => toSyncRun(row, now));
};

export const pruneSyncRuns = async () => {
  unwrap(
    await supabaseAdmin
      .from(SYNC_RUNS_TABLE)
      .delete()
      .lt(
        'started_at',
        new Date(Date.now() - SYNC_RUN_RETENTION_MS).toISOString(),
      ),
  );
};
