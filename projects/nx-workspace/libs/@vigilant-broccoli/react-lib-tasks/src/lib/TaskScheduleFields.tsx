'use client';

import { RotateCcw } from 'lucide-react';
import { useState } from 'react';
import {
  Button,
  Calendar,
  SegmentedControl,
  ToggleChipGroup,
} from '@vigilant-broccoli/react-lib';
import {
  ALL_DAYS,
  MONTHLY_ORDINALS,
  MONTH_DATES,
  TaskSchedule,
  WEEKDAYS,
  describeDays,
  formatOccurrenceDate,
  getNextOccurrences,
  getRelativeDayLabel,
  occursOn,
} from './recurrence';

const DATE_COLUMNS = 10;

// Matches no preset, so the segmented control shows none selected.
const CUSTOM_PRESET = '';

const WEEKDAY_PRESETS = [
  { label: 'Daily', days: ALL_DAYS },
  { label: 'Weekdays', days: [1, 2, 3, 4, 5] },
  { label: 'Weekends', days: [6, 0] },
];

const isSameSet = (a: number[], b: number[]) =>
  a.length === b.length && a.every(value => b.includes(value));

type Props = {
  schedule: TaskSchedule;
  onChange: (update: (prev: TaskSchedule) => TaskSchedule) => void;
};

const toggleValue = (values: number[], value: number) =>
  values.includes(value) ? values.filter(v => v !== value) : [...values, value];

const ORDINAL_OPTIONS = MONTHLY_ORDINALS.map(({ nth, label }) => ({
  value: nth,
  label,
}));
const DATE_OPTIONS = MONTH_DATES.map(date => ({
  value: date,
  label: String(date),
}));
const WEEKDAY_OPTIONS = WEEKDAYS.map(({ day, label }) => ({
  value: day,
  label,
}));

const SCHEDULE_MODE = {
  WEEKLY: 'weekly',
  NTH_WEEKDAY: 'nthWeekday',
  DATE: 'date',
} as const;

type ScheduleMode = (typeof SCHEDULE_MODE)[keyof typeof SCHEDULE_MODE];

const MODE_OPTIONS: { value: ScheduleMode; label: string }[] = [
  { value: SCHEDULE_MODE.WEEKLY, label: 'Every week' },
  { value: SCHEDULE_MODE.NTH_WEEKDAY, label: 'Weekday of month' },
  { value: SCHEDULE_MODE.DATE, label: 'Date of month' },
];

const getMode = ({ monthlyNth, monthlyDates }: TaskSchedule): ScheduleMode =>
  monthlyDates
    ? SCHEDULE_MODE.DATE
    : monthlyNth
      ? SCHEDULE_MODE.NTH_WEEKDAY
      : SCHEDULE_MODE.WEEKLY;

const switchMode = (prev: TaskSchedule, mode: ScheduleMode): TaskSchedule => ({
  // Date mode ignores weekdays; keeping them all selected leaves a valid
  // `days` for the NOT NULL column and for switching back.
  days: mode === SCHEDULE_MODE.DATE ? ALL_DAYS : prev.days,
  monthlyNth:
    mode === SCHEDULE_MODE.NTH_WEEKDAY ? (prev.monthlyNth ?? []) : null,
  monthlyDates: mode === SCHEDULE_MODE.DATE ? (prev.monthlyDates ?? []) : null,
});

export function TaskScheduleFields({ schedule, onChange }: Props) {
  const { days, monthlyNth, monthlyDates } = schedule;
  const mode = getMode(schedule);
  const isSelectionEmpty =
    mode === SCHEDULE_MODE.DATE
      ? !monthlyDates?.length
      : days.length === 0 ||
        (mode === SCHEDULE_MODE.NTH_WEEKDAY && !monthlyNth?.length);
  const [month, setMonth] = useState(() => new Date());
  const today = new Date();
  const [nextOccurrence] = isSelectionEmpty
    ? []
    : getNextOccurrences(schedule, today, 1);

  return (
    <>
      <SegmentedControl
        label="Repeat mode"
        fullWidth
        options={MODE_OPTIONS}
        value={mode}
        onChange={value => onChange(prev => switchMode(prev, value))}
      />
      {mode === SCHEDULE_MODE.WEEKLY && (
        <SegmentedControl
          label="Weekday preset"
          fullWidth
          options={WEEKDAY_PRESETS.map(({ label }) => ({
            value: label,
            label,
          }))}
          value={
            WEEKDAY_PRESETS.find(preset => isSameSet(days, preset.days))
              ?.label ?? CUSTOM_PRESET
          }
          onChange={value =>
            onChange(prev => ({
              ...prev,
              days:
                WEEKDAY_PRESETS.find(({ label }) => label === value)?.days ??
                prev.days,
            }))
          }
        />
      )}
      {mode === SCHEDULE_MODE.DATE && (
        <ToggleChipGroup
          label="Dates of month"
          columns={DATE_COLUMNS}
          options={DATE_OPTIONS}
          selected={monthlyDates ?? []}
          onToggle={date =>
            onChange(prev => ({
              ...prev,
              monthlyDates: toggleValue(prev.monthlyDates ?? [], date),
            }))
          }
        />
      )}
      {mode === SCHEDULE_MODE.NTH_WEEKDAY && monthlyNth && (
        <ToggleChipGroup
          label="Weeks of month"
          options={ORDINAL_OPTIONS}
          selected={monthlyNth}
          onToggle={nth =>
            onChange(prev => ({
              ...prev,
              monthlyNth: toggleValue(prev.monthlyNth ?? [], nth),
            }))
          }
        />
      )}
      {mode !== SCHEDULE_MODE.DATE && (
        <ToggleChipGroup
          label="Weekdays"
          shape="oval"
          options={WEEKDAY_OPTIONS}
          selected={days}
          onToggle={day =>
            onChange(prev => ({ ...prev, days: toggleValue(prev.days, day) }))
          }
        />
      )}
      <div className="flex items-start justify-between gap-2">
        <div className="text-xs text-muted-foreground">
          {nextOccurrence ? (
            <>
              <p className="font-medium">Repeats {describeDays(schedule)}</p>
              <p>
                Next: {formatOccurrenceDate(nextOccurrence)} ·{' '}
                {getRelativeDayLabel(nextOccurrence, today)}
              </p>
            </>
          ) : (
            <p>
              {mode === SCHEDULE_MODE.DATE
                ? 'Select at least one date to preview.'
                : mode === SCHEDULE_MODE.NTH_WEEKDAY
                  ? 'Select at least one week and weekday to preview.'
                  : 'Select at least one weekday to preview.'}
            </p>
          )}
        </div>
        <Button
          size="sm"
          variant="outline"
          disabled={
            mode === SCHEDULE_MODE.DATE
              ? !monthlyDates?.length
              : days.length === 0 && !monthlyNth?.length
          }
          onClick={() =>
            onChange(prev =>
              mode === SCHEDULE_MODE.DATE
                ? { ...prev, monthlyDates: [] }
                : {
                    ...prev,
                    days: [],
                    monthlyNth: prev.monthlyNth ? [] : null,
                  },
            )
          }
        >
          <RotateCcw size={14} />
          Reset
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Highlighted days are when this task repeats. Use the arrows to check
        other months.
      </p>
      <Calendar
        month={month}
        onMonthChange={setMonth}
        isHighlighted={date => !isSelectionEmpty && occursOn(schedule, date)}
        className="self-center"
      />
    </>
  );
}
