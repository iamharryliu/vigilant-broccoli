'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Input,
  Select,
  Text,
} from '@vigilant-broccoli/react-lib';
import {
  CalendarEventBookmarkletMessage,
  HTTP_METHOD,
} from '@vigilant-broccoli/common-js';
import { authFetch } from '../../../libs/auth';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import {
  detectEventSourceType,
  EVENT_SOURCE_TYPE,
  EventCalendar,
  EventCalendarSource,
  isWebPageSourceUrl,
} from '../constants/event-calendars';

const LOAD_ERROR = 'Failed to load calendars';
const ADD_ERROR = 'Failed to add source';
const JSON_HEADERS = { 'Content-Type': 'application/json' };
const FULL_CALENDAR_LABEL = 'Full calendar';
const NEW_CALENDAR_LABEL = 'New calendar…';
const CREATE_ERROR = 'Failed to create calendar';

export type SourceDetection = Pick<
  CalendarEventBookmarkletMessage,
  'url' | 'title' | 'feedUrls' | 'declaredFeedUrls'
>;

interface DetectedFeed {
  url: string;
  eventCount: number;
  titles: string[];
  declared: boolean;
}

interface SourceOption {
  label: string;
  source: EventCalendarSource;
}

const isFacebookSourceType = (url: string) => {
  const type = detectEventSourceType(url);
  return (
    type === EVENT_SOURCE_TYPE.FACEBOOK_GROUP ||
    type === EVENT_SOURCE_TYPE.FACEBOOK_PAGE
  );
};

const describeFeed = (feed: DetectedFeed, isMaster: boolean) => {
  const count = `${feed.eventCount} event${feed.eventCount === 1 ? '' : 's'}`;
  const sample = feed.titles.length ? ` — ${feed.titles.join(', ')}` : '';
  return `${isMaster ? `${FULL_CALENDAR_LABEL}: ` : ''}${feed.url} (${count}${sample})`;
};

const buildOptions = (
  detection: SourceDetection,
  feeds: DetectedFeed[],
): SourceOption[] => {
  const usable = feeds.filter(feed => feed.eventCount > 0);
  const options: SourceOption[] = usable.map((feed, index) => ({
    label: describeFeed(
      feed,
      index === 0 && usable.length > 1 && feed.eventCount > 1,
    ),
    source: { url: feed.url, sourceType: EVENT_SOURCE_TYPE.ICAL_FEED },
  }));
  if (isFacebookSourceType(detection.url)) {
    options.unshift({
      label: detection.url,
      source: {
        url: detection.url,
        sourceType: detectEventSourceType(detection.url)!,
      },
    });
  } else if (isWebPageSourceUrl(detection.url)) {
    // A master feed can lag the page, so when the page links per-event files
    // the page itself is the complete list and is preselected.
    const perEventCount = usable.filter(feed => feed.eventCount === 1).length;
    const pageOption: SourceOption = {
      label: perEventCount
        ? `This page: ${detection.url} (${perEventCount} events from its own links)`
        : `This page, read with AI: ${detection.url}`,
      source: { url: detection.url, sourceType: EVENT_SOURCE_TYPE.WEB_PAGE },
    };
    if (perEventCount) options.unshift(pageOption);
    else options.push(pageOption);
  }
  return options;
};

interface AddEventSourceDialogProps {
  detection: SourceDetection | null;
  onClose: () => void;
}

export const AddEventSourceDialog = ({
  detection,
  onClose,
}: AddEventSourceDialogProps) => {
  const [calendars, setCalendars] = useState<EventCalendar[]>([]);
  const [feeds, setFeeds] = useState<DetectedFeed[] | null>(null);
  const [calendarName, setCalendarName] = useState<string>();
  const [newCalendarName, setNewCalendarName] = useState('');
  const [optionLabel, setOptionLabel] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!detection) return;
    setFeeds(null);
    setOptionLabel(undefined);
    setNewCalendarName(detection.title?.trim() ?? '');
    setError(null);

    authFetch(API_ENDPOINTS.EVENT_CALENDARS)
      .then(response => {
        if (!response.ok) throw new Error(LOAD_ERROR);
        return response.json();
      })
      .then(data => setCalendars(data.calendars))
      .catch(err => setError(err instanceof Error ? err.message : LOAD_ERROR));

    authFetch(`${API_ENDPOINTS.EVENT_CALENDARS}/detect-feeds`, {
      method: HTTP_METHOD.POST,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        urls: detection.feedUrls ?? [],
        declaredUrls: detection.declaredFeedUrls ?? [],
      }),
    })
      .then(response => response.json())
      .then(data => setFeeds(data.feeds ?? []))
      .catch(() => setFeeds([]));
  }, [detection]);

  const options = useMemo(
    () => (detection && feeds ? buildOptions(detection, feeds) : []),
    [detection, feeds],
  );
  useEffect(() => {
    if (options.length) setOptionLabel(options[0].label);
  }, [options]);

  const selectedOption = options.find(option => option.label === optionLabel);
  const isNewCalendar = calendarName === NEW_CALENDAR_LABEL;
  const selectedCalendar = calendars.find(
    calendar => calendar.name === calendarName,
  );

  const readError = async (response: Response, fallback: string) => {
    const detail = await response.json().then(body => body?.error);
    return detail ?? fallback;
  };

  // A new calendar is created on the calendar service account and shared with
  // the signed-in user, exactly as the Create Event Calendar form does; the
  // server starts its first sync.
  const createCalendar = async (source: EventCalendarSource) => {
    const response = await authFetch(API_ENDPOINTS.EVENT_CALENDARS, {
      method: HTTP_METHOD.POST,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        name: newCalendarName.trim(),
        isPublic: false,
        sources: [source],
      }),
    });
    if (!response.ok) throw new Error(await readError(response, CREATE_ERROR));
  };

  const addToCalendar = async (
    calendar: EventCalendar,
    source: EventCalendarSource,
  ) => {
    const sources = calendar.sources.some(
      existing => existing.url === source.url,
    )
      ? calendar.sources
      : [...calendar.sources, source];
    const response = await authFetch(
      `${API_ENDPOINTS.EVENT_CALENDARS}/${calendar.id}`,
      {
        method: HTTP_METHOD.PATCH,
        headers: JSON_HEADERS,
        body: JSON.stringify({ sources }),
      },
    );
    if (!response.ok) throw new Error(await readError(response, ADD_ERROR));
    await authFetch(`${API_ENDPOINTS.EVENT_CALENDARS}/${calendar.id}/sync`, {
      method: HTTP_METHOD.POST,
    });
  };

  const submit = async () => {
    if (!selectedOption) return;
    setSubmitting(true);
    try {
      if (isNewCalendar) await createCalendar(selectedOption.source);
      else if (selectedCalendar) {
        await addToCalendar(selectedCalendar, selectedOption.source);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : ADD_ERROR);
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit =
    !!selectedOption &&
    (isNewCalendar ? !!newCalendarName.trim() : !!selectedCalendar);

  return (
    <Dialog open={!!detection} onOpenChange={open => !open && onClose()}>
      <DialogContent aria-describedby={undefined}>
        <DialogTitle>Add as event source</DialogTitle>
        <div className="flex flex-col gap-3">
          <Text size="1" color="gray">
            Adds this page to a managed event calendar, which re-syncs from it
            on every run. To import events once without tracking them, use the
            Create calendar event bookmarklet.
          </Text>
          {feeds === null ? (
            <Text size="2">Checking the page&apos;s calendar feeds…</Text>
          ) : options.length ? (
            <Select
              options={options.map(option => option.label)}
              value={optionLabel}
              onValueChange={setOptionLabel}
              triggerClassName="w-full"
            />
          ) : (
            <Text size="2">No usable calendar source found on this page.</Text>
          )}
          <Select
            options={[
              NEW_CALENDAR_LABEL,
              ...calendars.map(calendar => calendar.name),
            ]}
            value={calendarName}
            onValueChange={setCalendarName}
            placeholder="Choose a calendar"
            triggerClassName="w-full"
          />
          {isNewCalendar && (
            <Input
              placeholder="New calendar name"
              value={newCalendarName}
              onChange={event => setNewCalendarName(event.target.value)}
            />
          )}
          {error && (
            <Text size="1" color="red">
              {error}
            </Text>
          )}
          <Button onClick={submit} loading={submitting} disabled={!canSubmit}>
            {isNewCalendar ? 'Create and sync' : 'Add and sync'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
