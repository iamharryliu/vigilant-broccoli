'use client';
import {
  ExternalLink,
  Eye,
  EyeOff,
  Lock,
  RefreshCw,
  Unlock,
} from 'lucide-react';
import {
  Badge,
  Button,
  buttonVariants,
  Callout,
  CalloutText,
  Card,
  CopyButton,
  Input,
  Select,
  Switch,
  Text,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@vigilant-broccoli/react-lib';
import {
  CRUDFormProps,
  CRUDItemList,
  DeleteItemConfirmationDialog,
} from '@vigilant-broccoli/react-lib-higher-level';
import { FORM_TYPE, HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { useCallback, useEffect, useRef, useState } from 'react';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { useCalendarViewEventCalendars } from '../hooks/useCalendarViewEventCalendars';
import { authFetch } from '../../../libs/auth';
import { supabase } from '../../lib/supabase';
import {
  detectEventSourceType,
  EVENT_LANGUAGES,
  EVENT_SOURCE_TYPE,
  EventCalendar,
  SYNC_PHASE,
  SYNC_PHASE_ORDER,
  SYNC_RUN_STATUS,
  SYNC_RUN_TRIGGER,
  SyncPhase,
  SyncRun,
  UntrackedCalendar,
  buildGoogleCalendarUrl,
} from '../constants/event-calendars';

const FETCH_ERROR = 'Failed to fetch calendars';
const CREATE_ERROR = 'Failed to create calendar';
const UPDATE_ERROR = 'Failed to update calendar';
const DELETE_ERROR = 'Failed to delete calendar';
const LOADING_MESSAGE = 'Loading…';
const EMPTY_MESSAGE = 'No event calendars yet.';
const SYNC_ERROR = 'Failed to start sync';
const UNTRACKED_FETCH_ERROR = 'Failed to load untracked calendars';
const UNTRACKED_DELETE_ERROR = 'Failed to delete calendar';
const OPEN_IN_GOOGLE_CALENDAR = 'Open in Google Calendar';
const MAKE_PUBLIC_TITLE = 'Make this calendar public?';
const MAKE_PUBLIC_DESCRIPTION =
  'Anyone with the link will be able to see this calendar and all of its events, without signing in.';
const MAKE_PUBLIC_CONFIRM = 'Make public';
const UNTRACKED_TITLE = 'Untracked calendars';
const UNTRACKED_DESCRIPTION =
  'Owned by the calendar service account but not managed here — typically left behind by a deleted row. Deleting one removes it and all of its events for good.';
const UNTRACKED_UNAVAILABLE =
  'Google returns no calendar list for this service account, so calendars it owns outside this page cannot be listed. Calendars managed here are unaffected.';
const DETAILS_LABEL = 'Details';
const SYNC_NOW_LABEL = 'Sync now';
const LAST_SYNCED_LABEL = 'Last synced';
const PUBLIC_LABEL = 'Public';
const SHOW_IN_CALENDAR_VIEW_LABEL = 'Show in Calendar view';
const HIDE_FROM_CALENDAR_VIEW_LABEL = 'Hide from Calendar view';
const MAKE_PRIVATE_LABEL = 'Public — click to make private';
const MAKE_PUBLIC_LABEL = 'Private — click to make public';
const SYNC_POLL_INTERVAL_MS = 3000;
// Catches CLI-started runs and their results while the page stays open.
const SYNC_STATUS_REFRESH_INTERVAL_MS = 30_000;
const SYNC_RUNS_FETCH_ERROR = 'Failed to load sync history';
const SYNC_HISTORY_TITLE = 'Sync history';
const SYNC_HISTORY_EMPTY = 'No sync runs recorded yet.';
const STALE_LABEL = 'Stale';
const STALE_RUN_SUFFIX = ' (stale)';
const RUN_IN_PROGRESS_SUFFIX = ' so far';
const SYNC_RUN_TRIGGER_LABELS: Record<string, string> = {
  [SYNC_RUN_TRIGGER.CLI]: 'CLI',
  [SYNC_RUN_TRIGGER.UI]: 'UI',
};
const SYNC_RUN_STATUS_COLORS = {
  [SYNC_RUN_STATUS.RUNNING]: 'blue',
  [SYNC_RUN_STATUS.SUCCESS]: 'green',
  [SYNC_RUN_STATUS.PARTIAL]: 'amber',
  [SYNC_RUN_STATUS.FAILED]: 'red',
} as const;
const SYNC_RUNNING = 'running';
const SYNC_FAILED = 'failed';
const SYNC_SUCCEEDED = 'succeeded';
const SYNC_PHASE_LABELS: Record<string, string> = {
  [SYNC_PHASE.SCRAPING]: 'Scraping events',
  [SYNC_PHASE.LOCALIZING]: 'Writing titles and descriptions',
  [SYNC_PHASE.WRITING]: 'Updating Google Calendar',
};
const DISMISS_LABEL = 'Dismiss';
const ELAPSED_TICK_MS = 1000;
const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const PERCENT = 100;
const CALENDARS_CHANNEL = 'event-calendars-changes';
const POSTGRES_CHANGES_EVENT = 'postgres_changes';
const PUBLIC_SCHEMA = 'public';
const CALENDARS_TABLE = 'event_calendars';
const SOURCES_TABLE = 'event_calendar_sources';
const ADD_SOURCE_LABEL = 'Add URL';
const LANGUAGE_LABEL = 'Event language';
const LANGUAGE_PLACEHOLDER = "Keep each event's own language";
const REMOVE_SOURCE_LABEL = 'Remove';
const SOURCE_URL_PLACEHOLDER =
  'facebook.com/groups/<id>/events or facebook.com/<page>/events';

const LIST_COPY = {
  LIST: {
    TITLE: 'Event Calendars',
    EMPTY_MESSAGE,
  },
  [FORM_TYPE.CREATE]: {
    TITLE: 'Create Event Calendar',
    DESCRIPTION:
      'Creates a new Google Calendar owned by the calendar service account and shares it with you.',
  },
  [FORM_TYPE.UPDATE]: {
    TITLE: 'Event Calendar Details',
    DESCRIPTION:
      'Rename the calendar or change the URLs events are scraped from.',
  },
};

const CREATE_FORM_DEFAULT_VALUES: EventCalendar = {
  id: '',
  name: '',
  googleCalendarId: '',
  isPublic: false,
  language: '',
  sources: [],
  createdAt: '',
  updatedAt: '',
};

// Surfaces the route's own message (missing credential, Google API rejection,
// …) instead of a generic failure string that gives nothing to debug with.
interface SyncStatusView {
  state: string;
  message: string;
  startedAt?: string;
  finishedAt?: string;
  phase?: SyncPhase;
  done?: number;
  total?: number;
  lastSyncedAt?: string;
}

const formatElapsed = (startedAt: string, now: number) => {
  const seconds = Math.max(
    0,
    Math.floor((now - new Date(startedAt).getTime()) / MS_PER_SECOND),
  );
  return `${Math.floor(seconds / SECONDS_PER_MINUTE)}m ${String(seconds % SECONDS_PER_MINUTE).padStart(2, '0')}s`;
};

const SyncProgress = ({
  status,
  onDismiss,
}: {
  status: SyncStatusView;
  onDismiss: () => void;
}) => {
  const [now, setNow] = useState(() => Date.now());
  const isRunning = status.state === SYNC_RUNNING;

  useEffect(() => {
    if (!isRunning) return;
    const timer = setInterval(() => setNow(Date.now()), ELAPSED_TICK_MS);
    return () => clearInterval(timer);
  }, [isRunning]);

  if (isRunning) {
    const stepIndex = status.phase
      ? SYNC_PHASE_ORDER.indexOf(status.phase)
      : -1;
    const hasProgress = !!status.total && status.done !== undefined;
    return (
      <div className="flex w-full flex-col gap-1">
        <Text size="1" color="gray">
          {stepIndex >= 0 &&
            `Step ${stepIndex + 1} of ${SYNC_PHASE_ORDER.length} · ${SYNC_PHASE_LABELS[status.phase as SyncPhase]} · `}
          {status.startedAt && formatElapsed(status.startedAt, now)}
        </Text>
        <Text size="1" color="gray">
          {status.message}
        </Text>
        {hasProgress && (
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={status.total}
            aria-valuenow={status.done}
            className="h-1.5 w-full overflow-hidden rounded bg-gray-200 dark:bg-gray-700"
          >
            <div
              className="h-full bg-blue-600 transition-all"
              style={{
                width: `${Math.min(PERCENT, ((status.done as number) / (status.total as number)) * PERCENT)}%`,
              }}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex w-full items-center gap-2">
      <Text size="1" color={status.state === SYNC_FAILED ? 'red' : 'gray'}>
        {status.message}
      </Text>
      <Button variant="secondary" size="sm" onClick={onDismiss}>
        {DISMISS_LABEL}
      </Button>
    </div>
  );
};

const errorFromResponse = async (response: Response, fallback: string) => {
  const detail = await response
    .json()
    .then(body => body?.error)
    .catch(() => null);
  const message = detail ? `${fallback}: ${detail}` : fallback;
  return response.status === HTTP_STATUS_CODES.UNAUTHORIZED
    ? `${message} (not signed in — sign in and retry)`
    : message;
};

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
// The daily autosync plus a half-day of slack before a calendar is flagged.
const CALENDAR_STALE_MS = 36 * HOUR_MS;
const CALENDAR_STALE_TITLE = 'Not synced in the last 36 hours';

const isCalendarStale = (lastSyncedAt?: string) =>
  !lastSyncedAt ||
  Date.now() - new Date(lastSyncedAt).getTime() > CALENDAR_STALE_MS;

const formatRelativeTime = (iso: string) => {
  const elapsed = Date.now() - new Date(iso).getTime();
  if (elapsed < MINUTE_MS) return 'just now';
  if (elapsed < HOUR_MS) return `${Math.floor(elapsed / MINUTE_MS)}m ago`;
  if (elapsed < DAY_MS) return `${Math.floor(elapsed / HOUR_MS)}h ago`;
  return `${Math.floor(elapsed / DAY_MS)}d ago`;
};

const formatRunDuration = (run: SyncRun) => {
  if (run.finishedAt)
    return formatElapsed(run.startedAt, new Date(run.finishedAt).getTime());
  return run.stale
    ? ''
    : `${formatElapsed(run.startedAt, Date.now())}${RUN_IN_PROGRESS_SUFFIX}`;
};

const SyncHistory = ({
  runs,
  calendarNames,
  error,
}: {
  runs: SyncRun[];
  calendarNames: Record<string, string>;
  error: string | null;
}) => (
  <div className="flex flex-col gap-2">
    <Text weight="medium">{SYNC_HISTORY_TITLE}</Text>
    {error && (
      <Text size="1" color="red">
        {error}
      </Text>
    )}
    {!error && !runs.length && (
      <Text size="1" color="gray">
        {SYNC_HISTORY_EMPTY}
      </Text>
    )}
    {runs.map(run => (
      <Card key={run.id}>
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge color={SYNC_RUN_STATUS_COLORS[run.status]} size="1">
              {run.status}
              {run.stale && STALE_RUN_SUFFIX}
            </Badge>
            <Text size="1" color="gray">
              {[
                SYNC_RUN_TRIGGER_LABELS[run.trigger],
                new Date(run.startedAt).toLocaleString(),
                formatRunDuration(run),
              ]
                .filter(Boolean)
                .join(' · ')}
            </Text>
          </div>
          {run.results.map(result => (
            <Text
              key={result.calendarId}
              size="1"
              color={result.ok ? 'gray' : 'red'}
            >
              {calendarNames[result.calendarId] ?? result.calendarId}:{' '}
              {result.message}
            </Text>
          ))}
        </div>
      </Card>
    ))}
  </div>
);

const urlsToSources = (urls: string[]) =>
  urls
    .map(url => url.trim())
    .filter(Boolean)
    .map(url => ({
      url,
      sourceType:
        detectEventSourceType(url) ?? EVENT_SOURCE_TYPE.FACEBOOK_GROUP,
    }));

export const EventCalendarsComponent = () => {
  const [items, setItems] = useState<EventCalendar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCalendars = useCallback(async () => {
    try {
      const response = await authFetch(API_ENDPOINTS.EVENT_CALENDARS);
      if (!response.ok)
        throw new Error(await errorFromResponse(response, FETCH_ERROR));
      const data = await response.json();
      setItems(data.calendars);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : FETCH_ERROR);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCalendars();
  }, [fetchCalendars]);

  // Another machine editing the shared Supabase tables shows up here without a
  // reload — mirrors the notepad's live sync. Any change refetches the list,
  // which cascades to the sync-status and untracked effects keyed on items.
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;

    const channel = supabase
      .channel(CALENDARS_CHANNEL)
      .on(
        POSTGRES_CHANGES_EVENT,
        { event: '*', schema: PUBLIC_SCHEMA, table: CALENDARS_TABLE },
        () => fetchCalendars(),
      )
      .on(
        POSTGRES_CHANGES_EVENT,
        { event: '*', schema: PUBLIC_SCHEMA, table: SOURCES_TABLE },
        () => fetchCalendars(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchCalendars]);

  const createItem = async (item: EventCalendar) => {
    const response = await authFetch(API_ENDPOINTS.EVENT_CALENDARS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: item.name,
        isPublic: item.isPublic,
        language: item.language,
        sources: item.sources,
      }),
    });
    if (!response.ok)
      throw new Error(await errorFromResponse(response, CREATE_ERROR));
    const data = await response.json();
    setError(null);
    return data.calendar as EventCalendar;
  };

  const updateItem = async (item: EventCalendar) => {
    const response = await authFetch(
      `${API_ENDPOINTS.EVENT_CALENDARS}/${item.id}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: item.name,
          language: item.language,
          sources: item.sources,
        }),
      },
    );
    if (!response.ok) {
      const message = await errorFromResponse(response, UPDATE_ERROR);
      setError(message);
      throw new Error(message);
    }
    setError(null);
  };

  const deleteItem = async (id: string | number) => {
    const response = await authFetch(`${API_ENDPOINTS.EVENT_CALENDARS}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const message = await errorFromResponse(response, DELETE_ERROR);
      setError(message);
      throw new Error(message);
    }
    setError(null);
  };

  const togglePublic = async (id: string, isPublic: boolean) => {
    const response = await authFetch(`${API_ENDPOINTS.EVENT_CALENDARS}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublic }),
    });
    if (!response.ok) {
      setError(await errorFromResponse(response, UPDATE_ERROR));
      return;
    }
    setError(null);
    setItems(current =>
      current.map(item => (item.id === id ? { ...item, isPublic } : item)),
    );
  };

  const { hiddenIds, setShown } = useCalendarViewEventCalendars();
  const [syncStatuses, setSyncStatuses] = useState<
    Record<string, SyncStatusView>
  >({});
  const [dismissedSyncs, setDismissedSyncs] = useState<Record<string, string>>(
    {},
  );

  const refreshSyncStatus = async (id: string) => {
    const response = await authFetch(
      `${API_ENDPOINTS.EVENT_CALENDARS}/${id}/sync`,
    );
    if (!response.ok) return;
    const data = await response.json();
    const base =
      data.status ??
      (data.lastSyncMessage
        ? { state: 'idle', message: data.lastSyncMessage }
        : null);
    if (base)
      setSyncStatuses(current => ({
        ...current,
        [id]: { ...base, lastSyncedAt: data.lastSyncedAt },
      }));
  };

  const [syncRuns, setSyncRuns] = useState<SyncRun[]>([]);
  const [syncRunsError, setSyncRunsError] = useState<string | null>(null);

  const refreshSyncRuns = async () => {
    const response = await authFetch(
      `${API_ENDPOINTS.EVENT_CALENDARS}/sync-runs`,
    );
    if (!response.ok) {
      setSyncRunsError(
        await errorFromResponse(response, SYNC_RUNS_FETCH_ERROR),
      );
      return;
    }
    const data = await response.json();
    setSyncRuns(data.runs);
    setSyncRunsError(null);
  };

  const refreshAllSyncStatus = () => {
    refreshSyncRuns();
    items.forEach(item => refreshSyncStatus(item.id));
  };

  // Stale runs come back as failed, so only a live run counts as running.
  const activeRun = syncRuns.find(
    run => run.status === SYNC_RUN_STATUS.RUNNING,
  );

  // A CLI run happens outside this server's in-memory status map, so the
  // calendar it is on is only known from the run record.
  const displayedSyncStatus = (id: string): SyncStatusView | undefined => {
    const status = syncStatuses[id];
    if (status?.state === SYNC_RUNNING || activeRun?.currentCalendarId !== id)
      return status;
    return {
      state: SYNC_RUNNING,
      message: `Syncing in a ${SYNC_RUN_TRIGGER_LABELS[activeRun.trigger]} run`,
      startedAt: activeRun.startedAt,
      lastSyncedAt: status?.lastSyncedAt,
    };
  };

  useEffect(() => {
    items.forEach(item => refreshSyncStatus(item.id));
    refreshSyncRuns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  useEffect(() => {
    const timer = setInterval(
      refreshAllSyncStatus,
      SYNC_STATUS_REFRESH_INTERVAL_MS,
    );
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  useEffect(() => {
    const anyRunning =
      !!activeRun ||
      Object.values(syncStatuses).some(status => status.state === SYNC_RUNNING);
    if (!anyRunning) return;
    const timer = setInterval(refreshAllSyncStatus, SYNC_POLL_INTERVAL_MS);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncStatuses, syncRuns, items]);

  const startSync = async (id: string) => {
    const response = await authFetch(
      `${API_ENDPOINTS.EVENT_CALENDARS}/${id}/sync`,
      { method: 'POST' },
    );
    if (!response.ok) {
      setError(await errorFromResponse(response, SYNC_ERROR));
      return;
    }
    const data = await response.json();
    refreshSyncRuns();
    setDismissedSyncs(({ [id]: _removed, ...rest }) => rest);
    setSyncStatuses(current => ({
      ...current,
      [id]: { ...data.status, lastSyncedAt: current[id]?.lastSyncedAt },
    }));
  };

  const [untracked, setUntracked] = useState<UntrackedCalendar[]>([]);
  const [untrackedAvailable, setUntrackedAvailable] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<UntrackedCalendar | null>(
    null,
  );
  const [pendingPublic, setPendingPublic] = useState<EventCalendar | null>(
    null,
  );

  // Making a calendar public exposes every event to anyone with the link, so
  // it goes through a confirmation. Making one private again is safe and
  // applies immediately.
  const requestTogglePublic = (item: EventCalendar, isPublic: boolean) => {
    if (isPublic && !item.isPublic) {
      setPendingPublic(item);
      return;
    }
    togglePublic(item.id, isPublic);
  };

  const fetchUntracked = async () => {
    const response = await authFetch(
      `${API_ENDPOINTS.EVENT_CALENDARS}/untracked`,
    );
    if (!response.ok) {
      setError(await errorFromResponse(response, UNTRACKED_FETCH_ERROR));
      return;
    }
    const data = await response.json();
    setUntracked(data.calendars);
    setUntrackedAvailable(data.enumerationAvailable);
  };

  useEffect(() => {
    fetchUntracked();
  }, [items.length]);

  const deleteUntracked = async (calendar: UntrackedCalendar) => {
    const response = await authFetch(
      `${API_ENDPOINTS.EVENT_CALENDARS}/untracked/${encodeURIComponent(calendar.googleCalendarId)}`,
      { method: 'DELETE' },
    );
    if (!response.ok) {
      setError(await errorFromResponse(response, UNTRACKED_DELETE_ERROR));
      return;
    }
    setError(null);
    setUntracked(current =>
      current.filter(
        entry => entry.googleCalendarId !== calendar.googleCalendarId,
      ),
    );
  };

  const renderListItem = ({ item }: { item: EventCalendar }) => {
    const syncStatus = displayedSyncStatus(item.id);
    const lastSyncedAt = syncStatus?.lastSyncedAt ?? item.lastSyncedAt;
    return (
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <Text weight="medium">{item.name}</Text>
              {item.language && (
                <Badge color="blue" size="1">
                  {item.language}
                </Badge>
              )}
              {item.sources.length > 0 && isCalendarStale(lastSyncedAt) && (
                <Badge color="orange" size="1" title={CALENDAR_STALE_TITLE}>
                  {STALE_LABEL}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="contents">
              <a
                href={buildGoogleCalendarUrl(item.googleCalendarId)}
                target="_blank"
                rel="noreferrer"
                title={OPEN_IN_GOOGLE_CALENDAR}
                aria-label={OPEN_IN_GOOGLE_CALENDAR}
                className={buttonVariants({
                  variant: 'ghost',
                  size: 'icon',
                })}
              >
                <ExternalLink className="h-4 w-4" />
              </a>
              <CopyButton
                text={buildGoogleCalendarUrl(item.googleCalendarId)}
              />
            </div>
            {syncStatus &&
              (syncStatus.state === SYNC_RUNNING ||
                ((syncStatus.state === SYNC_FAILED ||
                  syncStatus.state === SYNC_SUCCEEDED) &&
                  dismissedSyncs[item.id] !== syncStatus.startedAt)) && (
                <SyncProgress
                  status={syncStatus}
                  onDismiss={() =>
                    setDismissedSyncs(current => ({
                      ...current,
                      [item.id]: syncStatus.startedAt as string,
                    }))
                  }
                />
              )}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={SYNC_NOW_LABEL}
                      onClick={() => startSync(item.id)}
                      loading={syncStatus?.state === SYNC_RUNNING}
                      disabled={!item.sources.length}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {lastSyncedAt
                    ? `${LAST_SYNCED_LABEL} ${formatRelativeTime(lastSyncedAt)}`
                    : SYNC_NOW_LABEL}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button
              variant="ghost"
              size="icon"
              title={
                hiddenIds.includes(item.id)
                  ? SHOW_IN_CALENDAR_VIEW_LABEL
                  : HIDE_FROM_CALENDAR_VIEW_LABEL
              }
              aria-label={SHOW_IN_CALENDAR_VIEW_LABEL}
              aria-pressed={!hiddenIds.includes(item.id)}
              onClick={() => setShown(item.id, hiddenIds.includes(item.id))}
            >
              {hiddenIds.includes(item.id) ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title={item.isPublic ? MAKE_PRIVATE_LABEL : MAKE_PUBLIC_LABEL}
              aria-label={PUBLIC_LABEL}
              aria-pressed={item.isPublic}
              onClick={() => requestTogglePublic(item, !item.isPublic)}
            >
              {item.isPublic ? (
                <Unlock className="h-4 w-4" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // A component declared in this body gets a new identity every render, so React
  // would remount each row and the switches could never animate. Keep one stable
  // component that always calls the latest render function.
  const renderListItemRef = useRef(renderListItem);
  renderListItemRef.current = renderListItem;
  const EventCalendarListItem = useCallback(
    (props: { item: EventCalendar }) => renderListItemRef.current(props),
    [],
  );

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <Callout color="red">
          <CalloutText>{error}</CalloutText>
        </Callout>
      )}
      <CRUDItemList
        items={items}
        setItems={setItems}
        ListItemComponent={EventCalendarListItem}
        FormComponent={EventCalendarForm}
        createItem={createItem}
        createItemFormDefaultValues={CREATE_FORM_DEFAULT_VALUES}
        updateItem={updateItem}
        updateLabel={DETAILS_LABEL}
        deleteItem={deleteItem}
        copy={{
          ...LIST_COPY,
          LIST: {
            ...LIST_COPY.LIST,
            EMPTY_MESSAGE: loading ? LOADING_MESSAGE : EMPTY_MESSAGE,
          },
        }}
        isCards
      />
      <SyncHistory
        runs={syncRuns}
        calendarNames={Object.fromEntries(
          items.map(item => [item.id, item.name]),
        )}
        error={syncRunsError}
      />
      {!untrackedAvailable && (
        <Text size="1" color="gray">
          {UNTRACKED_UNAVAILABLE}
        </Text>
      )}
      {untracked.length > 0 && (
        <div className="flex flex-col gap-2">
          <Text weight="medium">{UNTRACKED_TITLE}</Text>
          <Text size="1" color="gray">
            {UNTRACKED_DESCRIPTION}
          </Text>
          {untracked.map(calendar => (
            <Card key={calendar.googleCalendarId}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <Text weight="medium">{calendar.name}</Text>
                  <a
                    href={buildGoogleCalendarUrl(calendar.googleCalendarId)}
                    target="_blank"
                    rel="noreferrer"
                    title={OPEN_IN_GOOGLE_CALENDAR}
                    aria-label={OPEN_IN_GOOGLE_CALENDAR}
                    className={buttonVariants({
                      variant: 'ghost',
                      size: 'icon',
                    })}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <Text size="1" color={calendar.eventCount ? 'red' : 'gray'}>
                    {calendar.eventCount} event
                    {calendar.eventCount === 1 ? '' : 's'} would be destroyed
                  </Text>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => setPendingDelete(calendar)}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      {pendingDelete && (
        <DeleteItemConfirmationDialog
          open
          onOpenChange={open => !open && setPendingDelete(null)}
          title={`Delete "${pendingDelete.name}"?`}
          description={`This permanently deletes the calendar and its ${pendingDelete.eventCount} event(s). This cannot be undone.`}
          deleteItem={async () => {
            await deleteUntracked(pendingDelete);
            setPendingDelete(null);
          }}
        />
      )}
      {pendingPublic && (
        <DeleteItemConfirmationDialog
          open
          onOpenChange={open => !open && setPendingPublic(null)}
          title={MAKE_PUBLIC_TITLE}
          description={MAKE_PUBLIC_DESCRIPTION}
          confirmLabel={MAKE_PUBLIC_CONFIRM}
          deleteItem={async () => {
            await togglePublic(pendingPublic.id, true);
            setPendingPublic(null);
          }}
        />
      )}
    </div>
  );
};

const EventCalendarForm = ({
  formType,
  initialFormValues,
  submitHandler,
}: CRUDFormProps<EventCalendar>) => {
  const [item, setItem] = useState({
    ...initialFormValues,
    language: initialFormValues.language ?? '',
  });
  const [sourceUrls, setSourceUrls] = useState<string[]>(
    initialFormValues.sources.map(source => source.url),
  );
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const updateSourceUrl = (index: number, url: string) =>
    setSourceUrls(current =>
      current.map((entry, position) => (position === index ? url : entry)),
    );

  const addSourceUrl = () => setSourceUrls(current => [...current, '']);

  const removeSourceUrl = (index: number) =>
    setSourceUrls(current =>
      current.filter((_, position) => position !== index),
    );

  const handleSubmit = async () => {
    setSubmitting(true);
    setFormError(null);
    try {
      await submitHandler(
        { ...item, sources: urlsToSources(sourceUrls) },
        formType,
      );
    } catch (err) {
      setFormError(err instanceof Error ? err.message : CREATE_ERROR);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-3 flex flex-col gap-3">
      {formError && (
        <Callout color="red">
          <CalloutText>{formError}</CalloutText>
        </Callout>
      )}
      <Input
        placeholder="Calendar name (e.g. Malmö Latin Dance Events)"
        value={item.name}
        onChange={event => setItem({ ...item, name: event.target.value })}
      />
      <Text size="1" color="gray">
        {LANGUAGE_LABEL}
      </Text>
      <Select
        options={EVENT_LANGUAGES}
        value={item.language || undefined}
        onValueChange={language => setItem({ ...item, language })}
        placeholder={LANGUAGE_PLACEHOLDER}
        triggerClassName="w-full"
      />
      <Text size="1" color="gray">
        Source URLs
      </Text>
      <div className="flex flex-col gap-2">
        {sourceUrls.map((url, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              className="flex-1"
              placeholder={SOURCE_URL_PLACEHOLDER}
              value={url}
              onChange={event => updateSourceUrl(index, event.target.value)}
            />
            <CopyButton text={url} />
            <Button
              variant="secondary"
              type="button"
              onClick={() => removeSourceUrl(index)}
            >
              {REMOVE_SOURCE_LABEL}
            </Button>
          </div>
        ))}
        <Button variant="secondary" type="button" onClick={addSourceUrl}>
          {ADD_SOURCE_LABEL}
        </Button>
      </div>
      {formType === FORM_TYPE.CREATE && (
        <Text size="1" as="label">
          <div className="flex items-center gap-2">
            <Switch
              checked={item.isPublic}
              onCheckedChange={checked =>
                setItem({ ...item, isPublic: checked })
              }
            />
            Public calendar
          </div>
        </Text>
      )}
      <Button
        onClick={handleSubmit}
        loading={submitting}
        disabled={!item.name.trim()}
        className="w-full"
      >
        Submit
      </Button>
    </div>
  );
};
