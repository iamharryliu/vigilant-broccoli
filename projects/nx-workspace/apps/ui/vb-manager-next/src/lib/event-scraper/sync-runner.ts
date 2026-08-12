import { getCalendarAdminClient } from '../google-calendar-admin';
import { getEventCalendar, recordSyncResult } from '../event-calendars.db';
import {
  scrapeFacebookGroupEvents,
  ScrapedEvent,
} from './facebook-events.scraper';
import { syncEventsToCalendar } from './google-calendar.sync';
import { EVENT_SOURCE_TYPE } from '../../app/constants/event-calendars';

export const SYNC_STATE = {
  RUNNING: 'running',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
} as const;

export type SyncState = (typeof SYNC_STATE)[keyof typeof SYNC_STATE];

export interface SyncStatus {
  state: SyncState;
  message: string;
  startedAt: string;
  finishedAt?: string;
}

// A scrape takes minutes, far longer than a request should block, so runs are
// kicked off in the background and the UI polls this map. Restart-safe enough
// for a local single-instance app: the durable outcome lands in the db, this
// only tracks the in-flight run.
const runningSyncs = new Map<string, SyncStatus>();

export const getSyncStatus = (calendarId: string) =>
  runningSyncs.get(calendarId) ?? null;

const scrapeSource = (
  url: string,
  sourceType: string,
  onProgress: (message: string) => void,
) => {
  if (sourceType !== EVENT_SOURCE_TYPE.FACEBOOK_GROUP) {
    throw new Error(`No scraper implemented for source type "${sourceType}"`);
  }
  return scrapeFacebookGroupEvents({
    groupUrl: url,
    onProgress: (done, total) =>
      onProgress(`Scraping ${url} — ${done}/${total} events`),
  });
};

const runSync = async (calendarId: string) => {
  const setStatus = (message: string) => {
    const current = runningSyncs.get(calendarId);
    if (current) runningSyncs.set(calendarId, { ...current, message });
  };

  try {
    const eventCalendar = await getEventCalendar(calendarId);
    if (!eventCalendar) throw new Error('Calendar not found');
    if (!eventCalendar.sources.length) {
      throw new Error('No source URLs configured for this calendar');
    }

    const scraped: ScrapedEvent[] = [];
    for (const source of eventCalendar.sources) {
      setStatus(`Scraping ${source.url}`);
      scraped.push(
        ...(await scrapeSource(source.url, source.sourceType, setStatus)),
      );
    }

    // Sources can overlap (the same event shared to two groups); the calendar
    // event id is derived from the Facebook id, so dedupe before syncing to
    // avoid an insert/update race against ourselves.
    const uniqueEvents = [
      ...new Map(scraped.map(event => [event.id, event])).values(),
    ];

    setStatus(`Syncing ${uniqueEvents.length} events to Google Calendar`);
    const result = await syncEventsToCalendar(
      getCalendarAdminClient(),
      eventCalendar.googleCalendarId,
      uniqueEvents,
    );

    const message =
      `Synced ${result.synced} events` +
      (result.skipped ? `, ${result.skipped} skipped` : '') +
      (result.removed ? `, ${result.removed} removed` : '');

    runningSyncs.set(calendarId, {
      state: SYNC_STATE.SUCCEEDED,
      message,
      startedAt:
        runningSyncs.get(calendarId)?.startedAt ?? new Date().toISOString(),
      finishedAt: new Date().toISOString(),
    });
    await recordSyncResult(calendarId, message);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sync failed';
    console.error('[event-calendars] sync failed', error);
    runningSyncs.set(calendarId, {
      state: SYNC_STATE.FAILED,
      message,
      startedAt:
        runningSyncs.get(calendarId)?.startedAt ?? new Date().toISOString(),
      finishedAt: new Date().toISOString(),
    });
    await recordSyncResult(calendarId, `Failed: ${message}`);
  }
};

export const startSync = (calendarId: string): SyncStatus => {
  const existing = runningSyncs.get(calendarId);
  if (existing?.state === SYNC_STATE.RUNNING) return existing;

  const status: SyncStatus = {
    state: SYNC_STATE.RUNNING,
    message: 'Starting…',
    startedAt: new Date().toISOString(),
  };
  runningSyncs.set(calendarId, status);

  // Deliberately not awaited — the caller returns immediately and the UI polls.
  void runSync(calendarId);

  return status;
};
