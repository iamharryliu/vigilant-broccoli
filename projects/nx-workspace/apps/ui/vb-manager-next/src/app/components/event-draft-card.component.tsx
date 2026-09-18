'use client';

import { Button, Input, Switch, Text } from '@vigilant-broccoli/react-lib';
import { useState } from 'react';

export interface EventDraft {
  summary: string;
  description: string;
  location: string;
  start: string;
  end: string;
  timeZone: string;
  allDay: boolean;
  recurrence: string[];
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

const BYDAY_CODES = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
const CUSTOM_RECURRENCE_LABEL = 'custom';
const NO_RECURRENCE_VALUE = '';

const buildRecurrencePresets = (
  startIso: string,
): { value: string; label: string }[] => {
  const date = startIso ? new Date(startIso) : null;
  const isValid = date && !Number.isNaN(date.getTime());
  const dayCode = isValid ? BYDAY_CODES[date.getDay()] : null;
  const dayName = isValid
    ? date.toLocaleDateString(undefined, { weekday: 'long' })
    : null;

  const presets = [{ value: NO_RECURRENCE_VALUE, label: 'Does not repeat' }];
  if (!isValid) return presets;

  presets.push(
    { value: 'RRULE:FREQ=DAILY', label: 'Daily' },
    {
      value: `RRULE:FREQ=WEEKLY;BYDAY=${dayCode}`,
      label: `Weekly on ${dayName}`,
    },
    { value: 'RRULE:FREQ=MONTHLY', label: 'Monthly' },
    { value: 'RRULE:FREQ=YEARLY', label: 'Yearly' },
    {
      value: 'RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR',
      label: 'Every weekday (Mon-Fri)',
    },
  );
  return presets;
};

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
    <div className="flex flex-col gap-2" style={{ marginTop: '0.5rem' }}>
      <Text size="2" weight="medium">
        Calendar event
      </Text>

      <Input
        placeholder="Title"
        value={editable.summary}
        onChange={e =>
          setEditable(prev => ({ ...prev, summary: e.target.value }))
        }
        disabled={isReadOnly}
      />

      <div className="flex gap-2 items-center">
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
      </div>

      <div className="flex gap-2 items-center">
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
      </div>

      <div className="flex gap-2 items-center">
        <Text size="1" color="gray">
          All day
        </Text>
        <Switch
          checked={editable.allDay}
          onCheckedChange={handleAllDayChange}
          disabled={isReadOnly}
        />
      </div>

      <div className="flex gap-2 items-center">
        <Text size="1" color="gray" style={{ minWidth: '3rem' }}>
          Repeats
        </Text>
        <select
          value={editable.recurrence[0] ?? NO_RECURRENCE_VALUE}
          onChange={e =>
            setEditable(prev => ({
              ...prev,
              recurrence: e.target.value ? [e.target.value] : [],
            }))
          }
          disabled={isReadOnly}
          style={{ flex: 1, padding: '0.25rem 0.5rem' }}
        >
          {buildRecurrencePresets(editable.start).map(preset => (
            <option key={preset.value} value={preset.value}>
              {preset.label}
            </option>
          ))}
          {editable.recurrence[0] &&
            !buildRecurrencePresets(editable.start).some(
              preset => preset.value === editable.recurrence[0],
            ) && (
              <option value={editable.recurrence[0]}>
                {CUSTOM_RECURRENCE_LABEL}: {editable.recurrence[0]}
              </option>
            )}
        </select>
      </div>

      <Input
        placeholder="Location"
        value={editable.location}
        onChange={e =>
          setEditable(prev => ({ ...prev, location: e.target.value }))
        }
        disabled={isReadOnly}
      />

      <Input
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
        <div className="flex gap-2">
          <Button
            onClick={() => onCreate(editable)}
            disabled={
              status === 'creating' || !editable.summary || !editable.start
            }
          >
            {status === 'creating' ? 'Creating...' : 'Create event'}
          </Button>
          <Button variant="secondary" onClick={onCancel} disabled={isReadOnly}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};
