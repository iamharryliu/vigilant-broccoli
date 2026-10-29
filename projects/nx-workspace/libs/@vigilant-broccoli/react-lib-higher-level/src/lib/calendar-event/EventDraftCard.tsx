'use client';

import { useState } from 'react';
import { useCalendarEventTranslation } from './i18n';

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
const NO_RECURRENCE_VALUE = '';

const buildRecurrencePresets = (
  startIso: string,
  t: ReturnType<typeof useCalendarEventTranslation>['t'],
): { value: string; label: string }[] => {
  const date = startIso ? new Date(startIso) : null;
  const isValid = date && !Number.isNaN(date.getTime());
  const dayCode = isValid ? BYDAY_CODES[date.getDay()] : null;
  const dayName = isValid
    ? date.toLocaleDateString(undefined, { weekday: 'long' })
    : null;

  const presets = [{ value: NO_RECURRENCE_VALUE, label: t('NO_RECURRENCE') }];
  if (!isValid) return presets;

  presets.push(
    { value: 'RRULE:FREQ=DAILY', label: t('DAILY') },
    {
      value: `RRULE:FREQ=WEEKLY;BYDAY=${dayCode}`,
      label: t('WEEKLY', { day: dayName ?? '' }),
    },
    { value: 'RRULE:FREQ=MONTHLY', label: t('MONTHLY') },
    { value: 'RRULE:FREQ=YEARLY', label: t('YEARLY') },
    {
      value: 'RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR',
      label: t('WEEKDAYS'),
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
  const { t } = useCalendarEventTranslation();
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
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3 dark:bg-blue-950 dark:border-blue-900">
      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
        {t('EVENT')}
      </p>

      <input
        type="text"
        aria-label={t('TITLE_FIELD')}
        placeholder={t('TITLE_FIELD')}
        value={editable.summary}
        onChange={e =>
          setEditable(prev => ({ ...prev, summary: e.target.value }))
        }
        disabled={isReadOnly}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-gray-50 disabled:text-gray-400 dark:border-gray-700 dark:disabled:bg-gray-800 dark:disabled:text-gray-500"
      />

      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500 w-8 dark:text-gray-400">
          {t('START')}
        </span>
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
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-gray-50 dark:border-gray-700 dark:disabled:bg-gray-800"
        />
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500 w-8 dark:text-gray-400">
          {t('END')}
        </span>
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
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-gray-50 dark:border-gray-700 dark:disabled:bg-gray-800"
        />
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {t('ALL_DAY')}
        </span>
        <button
          role="switch"
          aria-checked={editable.allDay}
          aria-label={t('ALL_DAY')}
          onClick={() => handleAllDayChange(!editable.allDay)}
          disabled={isReadOnly}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${editable.allDay ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'} disabled:opacity-50`}
        >
          <span
            // eslint-disable-next-line vigilant-broccoli/require-dark-variant -- switch knob sits on a fixed blue or gray track in both themes
            className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${editable.allDay ? 'translate-x-5' : 'translate-x-1'}`}
          />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500 w-14 dark:text-gray-400">
          {t('REPEATS')}
        </span>
        <select
          value={editable.recurrence[0] ?? NO_RECURRENCE_VALUE}
          onChange={e =>
            setEditable(prev => ({
              ...prev,
              recurrence: e.target.value ? [e.target.value] : [],
            }))
          }
          disabled={isReadOnly}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-gray-50 dark:border-gray-700 dark:disabled:bg-gray-800"
        >
          {buildRecurrencePresets(editable.start, t).map(preset => (
            <option key={preset.value} value={preset.value}>
              {preset.label}
            </option>
          ))}
          {editable.recurrence[0] &&
            !buildRecurrencePresets(editable.start, t).some(
              preset => preset.value === editable.recurrence[0],
            ) && (
              <option value={editable.recurrence[0]}>
                {t('CUSTOM')}: {editable.recurrence[0]}
              </option>
            )}
        </select>
      </div>

      <input
        type="text"
        aria-label={t('LOCATION')}
        placeholder={t('LOCATION')}
        value={editable.location}
        onChange={e =>
          setEditable(prev => ({ ...prev, location: e.target.value }))
        }
        disabled={isReadOnly}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-gray-50 disabled:text-gray-400 dark:border-gray-700 dark:disabled:bg-gray-800 dark:disabled:text-gray-500"
      />

      <textarea
        aria-label={t('DESCRIPTION')}
        placeholder={t('DESCRIPTION')}
        value={editable.description}
        onChange={e =>
          setEditable(prev => ({ ...prev, description: e.target.value }))
        }
        disabled={isReadOnly}
        rows={2}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-gray-50 disabled:text-gray-400 resize-none dark:border-gray-700 dark:disabled:bg-gray-800 dark:disabled:text-gray-500"
      />

      {status === 'error' && errorMessage && (
        <p className="text-xs text-red-600 dark:text-red-300">{errorMessage}</p>
      )}

      {status === 'created' && (
        <p className="text-xs text-green-600 dark:text-green-300">
          {t('CREATED')}{' '}
          {eventLink && (
            <a
              href={eventLink}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              {t('OPEN')}
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
            {t(status === 'creating' ? 'CREATING' : 'CREATE')}
          </button>
          <button
            onClick={onCancel}
            disabled={isReadOnly}
            className="px-4 bg-gray-100 text-gray-600 rounded-lg py-2 text-sm font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            {t('CANCEL')}
          </button>
        </div>
      )}
    </div>
  );
};
