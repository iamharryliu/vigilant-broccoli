import { getCalendarAdminClient } from '../google-calendar-admin';
import {
  finishSyncRun,
  getEventCalendar,
  listEventCalendars,
  pruneSyncRuns,
  recordSyncResult,
  startSyncRun,
  updateSyncRun,
} from '../event-calendars.db';
import {
  FACEBOOK_LOGIN_REQUIRED_ERROR,
  scrapeFacebookEvents,
  ScrapedEvent,
} from './facebook-events.scraper';
import { syncEventsToCalendar } from './google-calendar.sync';
import { localizeEvents } from './event-localizer';
import {
  EVENT_SOURCE_TYPE,
  SYNC_PHASE,
  SYNC_RUN_STATUS,
  SYNC_RUN_TRIGGER,
  SyncPhase,
  SyncRunResult,
  SyncRunTrigger,
} from '@vigilant-broccoli/vb-manager-local-common';

export const SYNC_STATE = {
  RUNNING: 'running',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
} as const;

export type SyncState = (typeof SYNC_STATE)[keyof typeof SYNC_STATE];

export interface SyncProgress {
  message: string;
  phase?: SyncPhase;
  done?: number;
  total?: number;
}

export interface SyncStatus {
  state: SyncState;
  message: string;
  phase?: SyncPhase;
  done?: number;
  total?: number;
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

export interface SyncOutcome {
  state: SyncState;
  message: string;
  loginRequired?: boolean;
}

const FACEBOOK_SOURCE_TYPES: string[] = [
  EVENT_SOURCE_TYPE.FACEBOOK_GROUP,
  EVENT_SOURCE_TYPE.FACEBOOK_PAGE,
];

const scrapeSource = (
  url: string,
  sourceType: string,
  onProgress: (progress: SyncProgress) => void,
) => {
  if (!FACEBOOK_SOURCE_TYPES.includes(sourceType)) {
    throw new Error(`No scraper implemented for source type "${sourceType}"`);
  }
  return scrapeFacebookEvents({
    eventsUrl: url,
    onProgress: (done, total) =>
      onProgress({
        message: `Scraping ${url} — ${done}/${total} events`,
        phase: SYNC_PHASE.SCRAPING,
        done,
        total,
      }),
  });
};

const runSync = async (calendarId: string): Promise<SyncOutcome> => {
  const setStatus = ({ message, phase, done, total }: SyncProgress) => {
    const current = runningSyncs.get(calendarId);
    if (current) {
      runningSyncs.set(calendarId, { ...current, message, phase, done, total });
    }
  };

  try {
    const eventCalendar = await getEventCalendar(calendarId);
    if (!eventCalendar) throw new Error('Calendar not found');
    if (!eventCalendar.sources.length) {
      throw new Error('No source URLs configured for this calendar');
    }

    const scraped: ScrapedEvent[] = [];
    for (const source of eventCalendar.sources) {
      setStatus({
        message: `Scraping ${source.url}`,
        phase: SYNC_PHASE.SCRAPING,
      });
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

    const localizingMessage = `Writing titles and descriptions for ${uniqueEvents.length} events`;
    setStatus({
      message: localizingMessage,
      phase: SYNC_PHASE.LOCALIZING,
      done: 0,
      total: uniqueEvents.length,
    });
    const localizedEvents = await localizeEvents(
      uniqueEvents,
      eventCalendar.language,
      (done, total) =>
        setStatus({
          message: localizingMessage,
          phase: SYNC_PHASE.LOCALIZING,
          done,
          total,
        }),
    );

    setStatus({
      message: `Syncing ${uniqueEvents.length} events to Google Calendar`,
      phase: SYNC_PHASE.WRITING,
    });
    const result = await syncEventsToCalendar(
      getCalendarAdminClient(),
      eventCalendar.googleCalendarId,
      localizedEvents,
    );

    const message =
      `Synced ${result.synced} events` +
      (result.skipped ? `, ${result.skipped} skipped` : '') +
      (result.removed ? `, ${result.removed} removed` : '') +
      (result.staleDeletionSkipped
        ? `, stale deletion skipped (${result.staleDeletionSkipped})`
        : '');

    runningSyncs.set(calendarId, {
      state: SYNC_STATE.SUCCEEDED,
      message,
      startedAt:
        runningSyncs.get(calendarId)?.startedAt ?? new Date().toISOString(),
      finishedAt: new Date().toISOString(),
    });
    await recordSyncResult(calendarId, message);
    return { state: SYNC_STATE.SUCCEEDED, message };
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
    return {
      state: SYNC_STATE.FAILED,
      message,
      loginRequired: message === FACEBOOK_LOGIN_REQUIRED_ERROR,
    };
  }
};

// Well under the 30-minute stale threshold in event-calendars.db.ts, so one
// slow calendar (a long scrape or localization) never looks like a dead run.
const SYNC_RUN_HEARTBEAT_MS = 5 * 60_000;

const deriveRunStatus = (results: SyncRunResult[], expected: number) => {
  const succeeded = results.filter(result => result.ok).length;
  if (succeeded === expected) return SYNC_RUN_STATUS.SUCCESS;
  return succeeded ? SYNC_RUN_STATUS.PARTIAL : SYNC_RUN_STATUS.FAILED;
};

const runRecordedSync = async (
  trigger: SyncRunTrigger,
  calendarIds: string[],
  onOutcome?: (index: number, outcome: SyncOutcome) => void,
) => {
  await pruneSyncRuns();
  const runId = await startSyncRun(trigger);
  const results: SyncRunResult[] = [];
  const outcomes: SyncOutcome[] = [];
  const heartbeat = setInterval(
    () =>
      updateSyncRun(runId).catch(error =>
        console.error('[event-calendars] sync run heartbeat failed', error),
      ),
    SYNC_RUN_HEARTBEAT_MS,
  );
  try {
    for (const [index, calendarId] of calendarIds.entries()) {
      await updateSyncRun(runId, { currentCalendarId: calendarId });
      const outcome = await runSync(calendarId);
      outcomes.push(outcome);
      onOutcome?.(index, outcome);
      results.push({
        calendarId,
        ok: outcome.state === SYNC_STATE.SUCCEEDED,
        message: outcome.message,
      });
      await updateSyncRun(runId, { results });
      // Every remaining calendar would hit the same login wall.
      if (outcome.loginRequired) break;
    }
  } finally {
    clearInterval(heartbeat);
    await finishSyncRun(
      runId,
      deriveRunStatus(results, calendarIds.length),
      results,
    );
  }
  return outcomes;
};

export type SyncAllResult = SyncOutcome & { name: string };

// onResult fires as each calendar finishes, so a caller's log keeps the
// calendars completed before a crash instead of only the final summary.
export const runSyncAll = async (
  trigger: SyncRunTrigger,
  onResult?: (result: SyncAllResult) => void,
) => {
  const calendars = (await listEventCalendars()).filter(
    calendar => calendar.sources.length,
  );
  const outcomes = await runRecordedSync(
    trigger,
    calendars.map(calendar => calendar.id),
    (index, outcome) => onResult?.({ name: calendars[index].name, ...outcome }),
  );
  return outcomes.map((outcome, index) => ({
    name: calendars[index].name,
    ...outcome,
  }));
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
  void runRecordedSync(SYNC_RUN_TRIGGER.UI, [calendarId]).catch(error => {
    // runSync records its own failures; this is the run bookkeeping failing,
    // which would otherwise leave the calendar stuck as running.
    console.error('[event-calendars] sync run failed', error);
    if (runningSyncs.get(calendarId)?.state !== SYNC_STATE.RUNNING) return;
    runningSyncs.set(calendarId, {
      ...status,
      state: SYNC_STATE.FAILED,
      message: error instanceof Error ? error.message : 'Sync failed',
      finishedAt: new Date().toISOString(),
    });
  });

  return status;
};
