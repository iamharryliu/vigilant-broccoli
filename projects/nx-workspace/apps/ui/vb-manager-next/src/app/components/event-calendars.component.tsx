'use client';
import { Badge, Callout, Card, Flex, Link } from '@radix-ui/themes';
import {
  Button,
  CopyButton,
  CRUDFormProps,
  CRUDItemList,
  DeleteItemConfirmationDialog,
  Input,
  Switch,
  Text,
} from '@vigilant-broccoli/react-lib';
import { FORM_TYPE, HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { useCallback, useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { authFetch } from '../../../libs/auth';
import { supabase } from '../../lib/supabase';
import {
  detectEventSourceType,
  EVENT_SOURCE_TYPE,
  EVENT_SOURCE_TYPE_LABEL,
  EventCalendar,
  UntrackedCalendar,
  buildGoogleCalendarUrl,
} from '../constants/event-calendars';

const FETCH_ERROR = 'Failed to fetch calendars';
const CREATE_ERROR = 'Failed to create calendar';
const UPDATE_ERROR = 'Failed to update calendar';
const DELETE_ERROR = 'Failed to delete calendar';
const LOADING_MESSAGE = 'Loading…';
const EMPTY_MESSAGE = 'No event calendars yet.';
const UNKNOWN_SOURCE_LABEL = 'Unrecognized URL';
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
const SYNC_POLL_INTERVAL_MS = 3000;
const SYNC_RUNNING = 'running';
const CALENDARS_CHANNEL = 'event-calendars-changes';
const POSTGRES_CHANGES_EVENT = 'postgres_changes';
const PUBLIC_SCHEMA = 'public';
const CALENDARS_TABLE = 'event_calendars';
const SOURCES_TABLE = 'event_calendar_sources';
const ADD_SOURCE_LABEL = 'Add URL';
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
    TITLE: 'Update Event Calendar',
    DESCRIPTION:
      'Rename the calendar or change the URLs events are scraped from.',
  },
};

const CREATE_FORM_DEFAULT_VALUES: EventCalendar = {
  id: '',
  name: '',
  googleCalendarId: '',
  isPublic: false,
  sources: [],
  createdAt: '',
  updatedAt: '',
};

// Surfaces the route's own message (missing credential, Google API rejection,
// …) instead of a generic failure string that gives nothing to debug with.
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

const formatRelativeTime = (iso: string) => {
  const elapsed = Date.now() - new Date(iso).getTime();
  if (elapsed < MINUTE_MS) return 'just now';
  if (elapsed < HOUR_MS) return `${Math.floor(elapsed / MINUTE_MS)}m ago`;
  if (elapsed < DAY_MS) return `${Math.floor(elapsed / HOUR_MS)}h ago`;
  return `${Math.floor(elapsed / DAY_MS)}d ago`;
};

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
        body: JSON.stringify({ name: item.name, sources: item.sources }),
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

  const [syncStatuses, setSyncStatuses] = useState<
    Record<string, { state: string; message: string; lastSyncedAt?: string }>
  >({});

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

  useEffect(() => {
    items.forEach(item => refreshSyncStatus(item.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  useEffect(() => {
    const anyRunning = Object.values(syncStatuses).some(
      status => status.state === SYNC_RUNNING,
    );
    if (!anyRunning) return;
    const timer = setInterval(
      () => items.forEach(item => refreshSyncStatus(item.id)),
      SYNC_POLL_INTERVAL_MS,
    );
    return () => clearInterval(timer);
  }, [syncStatuses, items]);

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

  const EventCalendarListItem = ({ item }: { item: EventCalendar }) => (
    <Flex justify="between" align="center" gap="3" wrap="wrap">
      <Flex direction="column" gap="1">
        <Flex gap="2" align="center" wrap="wrap">
          <Text weight="medium">{item.name}</Text>
          <Badge color={item.isPublic ? 'green' : 'gray'} size="1">
            {item.isPublic ? 'public' : 'private'}
          </Badge>
        </Flex>
        <Flex gap="2" align="center">
          <Link
            size="1"
            href={buildGoogleCalendarUrl(item.googleCalendarId)}
            target="_blank"
            rel="noreferrer"
          >
            {OPEN_IN_GOOGLE_CALENDAR}
          </Link>
          <CopyButton text={buildGoogleCalendarUrl(item.googleCalendarId)} />
        </Flex>
        <Flex direction="column" gap="1">
          {item.sources.length ? (
            item.sources.map(source => (
              <Flex key={source.url} gap="2" align="center" wrap="wrap">
                <Badge size="1">
                  {EVENT_SOURCE_TYPE_LABEL[source.sourceType] ??
                    UNKNOWN_SOURCE_LABEL}
                </Badge>
                <Text size="1" color="gray">
                  {source.url}
                </Text>
              </Flex>
            ))
          ) : (
            <Text size="1" color="gray">
              No source URLs configured.
            </Text>
          )}
        </Flex>
      </Flex>
      <Flex direction="column" gap="2" align="end">
        <Flex direction="column" gap="1" align="center">
          <Text size="1" color="gray">
            Public
          </Text>
          <Switch
            checked={item.isPublic}
            onCheckedChange={checked => requestTogglePublic(item, checked)}
          />
        </Flex>
        <Button
          variant="secondary"
          onClick={() => startSync(item.id)}
          loading={syncStatuses[item.id]?.state === SYNC_RUNNING}
          disabled={!item.sources.length}
        >
          Sync now
        </Button>
        {syncStatuses[item.id] && (
          <Flex direction="column" gap="1" align="end">
            <Text size="1" color="gray">
              {syncStatuses[item.id].message}
            </Text>
            {syncStatuses[item.id].lastSyncedAt && (
              <Text size="1" color="gray">
                Last synced{' '}
                {formatRelativeTime(
                  syncStatuses[item.id].lastSyncedAt as string,
                )}
              </Text>
            )}
          </Flex>
        )}
      </Flex>
    </Flex>
  );

  return (
    <Flex direction="column" gap="4">
      {error && (
        <Callout.Root color="red">
          <Callout.Text>{error}</Callout.Text>
        </Callout.Root>
      )}
      <CRUDItemList
        items={items}
        setItems={setItems}
        ListItemComponent={EventCalendarListItem}
        FormComponent={EventCalendarForm}
        createItem={createItem}
        createItemFormDefaultValues={CREATE_FORM_DEFAULT_VALUES}
        updateItem={updateItem}
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
      {!untrackedAvailable && (
        <Text size="1" color="gray">
          {UNTRACKED_UNAVAILABLE}
        </Text>
      )}
      {untracked.length > 0 && (
        <Flex direction="column" gap="2">
          <Text weight="medium">{UNTRACKED_TITLE}</Text>
          <Text size="1" color="gray">
            {UNTRACKED_DESCRIPTION}
          </Text>
          {untracked.map(calendar => (
            <Card key={calendar.googleCalendarId}>
              <Flex justify="between" align="center" gap="3" wrap="wrap">
                <Flex direction="column" gap="1">
                  <Text weight="medium">{calendar.name}</Text>
                  <Link
                    size="1"
                    href={buildGoogleCalendarUrl(calendar.googleCalendarId)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {OPEN_IN_GOOGLE_CALENDAR}
                  </Link>
                  <Text size="1" color={calendar.eventCount ? 'red' : 'gray'}>
                    {calendar.eventCount} event
                    {calendar.eventCount === 1 ? '' : 's'} would be destroyed
                  </Text>
                </Flex>
                <Button
                  variant="secondary"
                  onClick={() => setPendingDelete(calendar)}
                >
                  Delete
                </Button>
              </Flex>
            </Card>
          ))}
        </Flex>
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
    </Flex>
  );
};

const EventCalendarForm = ({
  formType,
  initialFormValues,
  submitHandler,
}: CRUDFormProps<EventCalendar>) => {
  const [item, setItem] = useState(initialFormValues);
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
    <Flex direction="column" gap="3" className="mt-3">
      {formError && (
        <Callout.Root color="red">
          <Callout.Text>{formError}</Callout.Text>
        </Callout.Root>
      )}
      <Input
        placeholder="Calendar name (e.g. Malmö Latin Dance Events)"
        value={item.name}
        onChange={event => setItem({ ...item, name: event.target.value })}
      />
      <Text size="1" color="gray">
        Source URLs
      </Text>
      <Flex direction="column" gap="2">
        {sourceUrls.map((url, index) => (
          <Flex key={index} gap="2" align="center">
            <Input
              className="flex-1"
              placeholder={SOURCE_URL_PLACEHOLDER}
              value={url}
              onChange={event => updateSourceUrl(index, event.target.value)}
            />
            <Button
              variant="secondary"
              type="button"
              onClick={() => removeSourceUrl(index)}
            >
              {REMOVE_SOURCE_LABEL}
            </Button>
          </Flex>
        ))}
        <Button variant="secondary" type="button" onClick={addSourceUrl}>
          {ADD_SOURCE_LABEL}
        </Button>
      </Flex>
      {formType === FORM_TYPE.CREATE && (
        <Text size="1" as="label">
          <Flex gap="2" align="center">
            <Switch
              checked={item.isPublic}
              onCheckedChange={checked =>
                setItem({ ...item, isPublic: checked })
              }
            />
            Public calendar
          </Flex>
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
    </Flex>
  );
};
