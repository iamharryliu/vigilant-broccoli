'use client';

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
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
      <p className="text-sm font-medium text-blue-800">Calendar Event</p>

      <input
        type="text"
        placeholder="Title"
        value={editable.summary}
        onChange={e =>
          setEditable(prev => ({ ...prev, summary: e.target.value }))
        }
        disabled={isReadOnly}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-gray-50 disabled:text-gray-400"
      />

      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500 w-8">Start</span>
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
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-gray-50"
        />
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500 w-8">End</span>
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
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-gray-50"
        />
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500">All day</span>
        <button
          onClick={() => handleAllDayChange(!editable.allDay)}
          disabled={isReadOnly}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${editable.allDay ? 'bg-blue-500' : 'bg-gray-200'} disabled:opacity-50`}
        >
          <span
            className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${editable.allDay ? 'translate-x-5' : 'translate-x-1'}`}
          />
        </button>
      </div>

      <input
        type="text"
        placeholder="Location"
        value={editable.location}
        onChange={e =>
          setEditable(prev => ({ ...prev, location: e.target.value }))
        }
        disabled={isReadOnly}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-gray-50 disabled:text-gray-400"
      />

      <textarea
        placeholder="Description"
        value={editable.description}
        onChange={e =>
          setEditable(prev => ({ ...prev, description: e.target.value }))
        }
        disabled={isReadOnly}
        rows={2}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-gray-50 disabled:text-gray-400 resize-none"
      />

      {status === 'error' && errorMessage && (
        <p className="text-xs text-red-600">{errorMessage}</p>
      )}

      {status === 'created' && (
        <p className="text-xs text-green-600">
          Event created.{' '}
          {eventLink && (
            <a
              href={eventLink}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              Open in Google Calendar
            </a>
          )}
        </p>
      )}

      {status !== 'created' && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => onCreate(editable)}
            disabled={
              status === 'creating' || !editable.summary || !editable.start
            }
            className="flex-1 bg-blue-500 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {status === 'creating' ? 'Creating...' : 'Create event'}
          </button>
          <button
            onClick={onCancel}
            disabled={isReadOnly}
            className="px-4 bg-gray-100 text-gray-600 rounded-lg py-2 text-sm font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};
