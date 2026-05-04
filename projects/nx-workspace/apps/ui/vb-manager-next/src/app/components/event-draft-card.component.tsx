'use client';

import { Button, Flex, Text, TextField, Switch } from '@radix-ui/themes';
import { useState } from 'react';

export interface EventDraft {
  summary: string;
  description: string;
  location: string;
  start: string;
  end: string;
  timeZone: string;
  allDay: boolean;
}

export type EventDraftStatus = 'draft' | 'creating' | 'created' | 'error';

interface EventDraftCardProps {
  draft: EventDraft;
  status: EventDraftStatus;
  errorMessage?: string;
  eventLink?: string;
  onCreate: (draft: EventDraft) => void;
  onCancel: () => void;
}

const ALL_DAY_INPUT_LENGTH = 10;
const DATETIME_LOCAL_LENGTH = 16;

const toInputValue = (iso: string, allDay: boolean): string => {
  if (!iso) return '';
  if (allDay) return iso.slice(0, ALL_DAY_INPUT_LENGTH);
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const tzOffsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - tzOffsetMs)
    .toISOString()
    .slice(0, DATETIME_LOCAL_LENGTH);
};

const fromInputValue = (value: string, allDay: boolean): string => {
  if (!value) return '';
  if (allDay) return value;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
};

export const EventDraftCard = ({
  draft,
  status,
  errorMessage,
  eventLink,
  onCreate,
  onCancel,
}: EventDraftCardProps) => {
  const [editable, setEditable] = useState<EventDraft>(draft);

  const isReadOnly = status === 'creating' || status === 'created';

  const handleAllDayChange = (allDay: boolean) => {
    setEditable(prev => ({
      ...prev,
      allDay,
      start: prev.start
        ? prev.start.slice(0, ALL_DAY_INPUT_LENGTH)
        : prev.start,
      end: prev.end ? prev.end.slice(0, ALL_DAY_INPUT_LENGTH) : prev.end,
    }));
  };

  return (
    <Flex direction="column" gap="2" style={{ marginTop: '0.5rem' }}>
      <Text size="2" weight="medium">
        Calendar event
      </Text>

      <TextField.Root
        placeholder="Title"
        value={editable.summary}
        onChange={e =>
          setEditable(prev => ({ ...prev, summary: e.target.value }))
        }
        disabled={isReadOnly}
      />

      <Flex gap="2" align="center">
        <Text size="1" color="gray" style={{ minWidth: '3rem' }}>
          Start
        </Text>
        <input
          type={editable.allDay ? 'date' : 'datetime-local'}
          value={toInputValue(editable.start, editable.allDay)}
          onChange={e =>
            setEditable(prev => ({
              ...prev,
              start: fromInputValue(e.target.value, prev.allDay),
            }))
          }
          disabled={isReadOnly}
          style={{ flex: 1, padding: '0.25rem 0.5rem' }}
        />
      </Flex>

      <Flex gap="2" align="center">
        <Text size="1" color="gray" style={{ minWidth: '3rem' }}>
          End
        </Text>
        <input
          type={editable.allDay ? 'date' : 'datetime-local'}
          value={toInputValue(editable.end, editable.allDay)}
          onChange={e =>
            setEditable(prev => ({
              ...prev,
              end: fromInputValue(e.target.value, prev.allDay),
            }))
          }
          disabled={isReadOnly}
          style={{ flex: 1, padding: '0.25rem 0.5rem' }}
        />
      </Flex>

      <Flex gap="2" align="center">
        <Text size="1" color="gray">
          All day
        </Text>
        <Switch
          checked={editable.allDay}
          onCheckedChange={handleAllDayChange}
          disabled={isReadOnly}
        />
      </Flex>

      <TextField.Root
        placeholder="Location"
        value={editable.location}
        onChange={e =>
          setEditable(prev => ({ ...prev, location: e.target.value }))
        }
        disabled={isReadOnly}
      />

      <TextField.Root
        placeholder="Description"
        value={editable.description}
        onChange={e =>
          setEditable(prev => ({ ...prev, description: e.target.value }))
        }
        disabled={isReadOnly}
      />

      {status === 'error' && errorMessage && (
        <Text size="1" color="red">
          {errorMessage}
        </Text>
      )}

      {status === 'created' && (
        <Text size="1" color="green">
          Event created.{' '}
          {eventLink && (
            <a href={eventLink} target="_blank" rel="noreferrer">
              Open in Google Calendar
            </a>
          )}
        </Text>
      )}

      {status !== 'created' && (
        <Flex gap="2">
          <Button
            onClick={() => onCreate(editable)}
            disabled={
              status === 'creating' || !editable.summary || !editable.start
            }
          >
            {status === 'creating' ? 'Creating...' : 'Create event'}
          </Button>
          <Button variant="soft" onClick={onCancel} disabled={isReadOnly}>
            Cancel
          </Button>
        </Flex>
      )}
    </Flex>
  );
};
