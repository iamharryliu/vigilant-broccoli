'use client';
import { Badge, Callout, Code, Flex, Text } from '@radix-ui/themes';
import {
  Button,
  CRUDFormProps,
  CRUDItemList,
  Input,
  Switch,
} from '@vigilant-broccoli/react-lib';
import { FORM_TYPE } from '@vigilant-broccoli/common-js';
import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { authFetch } from '../../../libs/auth';
import {
  detectEventSourceType,
  EVENT_SOURCE_TYPE,
  EVENT_SOURCE_TYPE_LABEL,
  EventCalendar,
} from '../constants/event-calendars';

const FETCH_ERROR = 'Failed to fetch calendars';
const CREATE_ERROR = 'Failed to create calendar';
const UPDATE_ERROR = 'Failed to update calendar';
const DELETE_ERROR = 'Failed to delete calendar';
const LOADING_MESSAGE = 'Loading…';
const EMPTY_MESSAGE = 'No event calendars yet.';
const UNKNOWN_SOURCE_LABEL = 'Unrecognized URL';
const SOURCES_PLACEHOLDER =
  'One URL per line, e.g. https://www.facebook.com/groups/klubbkalenderlatin/events';

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

const sourcesToText = (calendar: EventCalendar) =>
  calendar.sources.map(source => source.url).join('\n');

const textToSources = (text: string) =>
  text
    .split('\n')
    .map(line => line.trim())
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

  useEffect(() => {
    const fetchCalendars = async () => {
      try {
        const response = await authFetch(API_ENDPOINTS.EVENT_CALENDARS);
        if (!response.ok) throw new Error(FETCH_ERROR);
        const data = await response.json();
        setItems(data.calendars);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : FETCH_ERROR);
      } finally {
        setLoading(false);
      }
    };
    fetchCalendars();
  }, []);

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
    if (!response.ok) throw new Error(CREATE_ERROR);
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
      setError(UPDATE_ERROR);
      throw new Error(UPDATE_ERROR);
    }
    setError(null);
  };

  const deleteItem = async (id: string | number) => {
    const response = await authFetch(`${API_ENDPOINTS.EVENT_CALENDARS}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      setError(DELETE_ERROR);
      throw new Error(DELETE_ERROR);
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
      setError(UPDATE_ERROR);
      return;
    }
    setError(null);
    setItems(current =>
      current.map(item => (item.id === id ? { ...item, isPublic } : item)),
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
        <Code size="1">{item.googleCalendarId}</Code>
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
      <Flex direction="column" gap="1" align="center">
        <Text size="1" color="gray">
          Public
        </Text>
        <Switch
          checked={item.isPublic}
          onCheckedChange={checked => togglePublic(item.id, checked)}
        />
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
    </Flex>
  );
};

const EventCalendarForm = ({
  formType,
  initialFormValues,
  submitHandler,
}: CRUDFormProps<EventCalendar>) => {
  const [item, setItem] = useState(initialFormValues);
  const [sourcesText, setSourcesText] = useState(
    sourcesToText(initialFormValues),
  );
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setSubmitting(true);
    setFormError(null);
    try {
      await submitHandler(
        { ...item, sources: textToSources(sourcesText) },
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
      <textarea
        className="min-h-32 w-full rounded border border-gray-6 bg-transparent p-2 text-sm"
        placeholder={SOURCES_PLACEHOLDER}
        value={sourcesText}
        onChange={event => setSourcesText(event.target.value)}
      />
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
