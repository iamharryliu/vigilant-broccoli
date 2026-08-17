import { randomUUID } from 'crypto';
import { supabaseAdmin } from './supabase-admin';
import {
  EventCalendar,
  EventCalendarSource,
  EventSourceType,
} from '../app/constants/event-calendars';

// Tracking lives in shared Supabase (not per-machine SQLite) so every machine
// reads the same list; see the create_event_calendars migration.
const CALENDARS_TABLE = 'event_calendars';
const SOURCES_TABLE = 'event_calendar_sources';

interface EventCalendarRow {
  id: string;
  name: string;
  google_calendar_id: string;
  is_public: boolean;
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
  sources,
}: {
  name: string;
  googleCalendarId: string;
  isPublic: boolean;
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
