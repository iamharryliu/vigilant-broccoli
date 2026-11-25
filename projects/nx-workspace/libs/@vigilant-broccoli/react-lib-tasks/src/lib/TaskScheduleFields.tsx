'use client';

import { CalendarDays, RotateCcw } from 'lucide-react';
import { useId, useState } from 'react';
import {
  Button,
  Calendar,
  DatePicker,
  cn,
  Select,
  ToggleChipGroup,
} from '@vigilant-broccoli/react-lib';
import {
  ALL_DAYS,
  MONTHLY_ORDINALS,
  MONTH_DATES,
  MONTH_LABELS,
  TaskSchedule,
  WEEKDAYS,
  describeDays,
  formatOccurrenceDate,
  fromAnnualDate,
  fromDateKey,
  getNextOccurrences,
  getRelativeDayLabel,
  getWeekOfMonthOrdinal,
  occursOn,
  toAnnualDate,
  toDateKey,
} from './recurrence';

const DATE_COLUMNS = 10;

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

// A leap year, so the picker offers Feb 29.
const LEAP_YEAR = 2000;

const toLeapYearDate = (annualDate: string) => {
  const { month, day } = fromAnnualDate(annualDate);
  return new Date(LEAP_YEAR, month - 1, day);
};

const SCHEDULE_MODE = {
  ONCE: 'once',
  DAILY: 'daily',
  WEEKDAYS: 'weekdays',
  WEEKENDS: 'weekends',
  WEEKLY: 'weekly',
  NTH_WEEKDAY: 'nthWeekday',
  DATE: 'date',
  ANNUAL: 'annual',
} as const;

type ScheduleMode = (typeof SCHEDULE_MODE)[keyof typeof SCHEDULE_MODE];

const MODE_OPTIONS: { value: ScheduleMode; label: string }[] = [
  { value: SCHEDULE_MODE.ONCE, label: 'Does not repeat' },
  { value: SCHEDULE_MODE.DAILY, label: 'Daily' },
  { value: SCHEDULE_MODE.WEEKDAYS, label: 'Weekdays' },
  { value: SCHEDULE_MODE.WEEKENDS, label: 'Weekends' },
  { value: SCHEDULE_MODE.WEEKLY, label: 'Every week' },
  { value: SCHEDULE_MODE.NTH_WEEKDAY, label: 'Weekday of month' },
  { value: SCHEDULE_MODE.DATE, label: 'Date of month' },
  { value: SCHEDULE_MODE.ANNUAL, label: 'Annually' },
];

const PRESET_DAYS: Partial<Record<ScheduleMode, number[]>> = {
  [SCHEDULE_MODE.DAILY]: ALL_DAYS,
  [SCHEDULE_MODE.WEEKDAYS]: [1, 2, 3, 4, 5],
  [SCHEDULE_MODE.WEEKENDS]: [6, 0],
};

// Modes whose schedule ignores weekdays, so `days` stays all selected.
const WEEKDAY_FREE_MODES: ScheduleMode[] = [
  SCHEDULE_MODE.ONCE,
  SCHEDULE_MODE.DATE,
  SCHEDULE_MODE.ANNUAL,
];

const PRESET_MODES = Object.keys(PRESET_DAYS) as ScheduleMode[];

const getMode = ({
  days,
  monthlyNth,
  monthlyDates,
  onceDate,
  annualDate,
}: TaskSchedule): ScheduleMode =>
  onceDate
    ? SCHEDULE_MODE.ONCE
    : annualDate
      ? SCHEDULE_MODE.ANNUAL
      : monthlyDates
        ? SCHEDULE_MODE.DATE
        : monthlyNth
          ? SCHEDULE_MODE.NTH_WEEKDAY
          : (PRESET_MODES.find(mode =>
              isSameSet(days, PRESET_DAYS[mode] ?? []),
            ) ?? SCHEDULE_MODE.WEEKLY);

const switchMode = (prev: TaskSchedule, mode: ScheduleMode): TaskSchedule => ({
  // Keeping every weekday selected leaves a valid `days` for the NOT NULL
  // column and for switching back.
  days:
    PRESET_DAYS[mode] ??
    (WEEKDAY_FREE_MODES.includes(mode)
      ? ALL_DAYS
      : mode === SCHEDULE_MODE.WEEKLY || mode === SCHEDULE_MODE.NTH_WEEKDAY
        ? [new Date().getDay()]
        : prev.days),
  monthlyNth:
    mode === SCHEDULE_MODE.NTH_WEEKDAY
      ? (prev.monthlyNth ?? [getWeekOfMonthOrdinal(new Date())])
      : null,
  monthlyDates:
    mode === SCHEDULE_MODE.DATE
      ? (prev.monthlyDates ?? [new Date().getDate()])
      : null,
  onceDate:
    mode === SCHEDULE_MODE.ONCE
      ? (prev.onceDate ?? toDateKey(new Date()))
      : null,
  annualDate:
    mode === SCHEDULE_MODE.ANNUAL
      ? (prev.annualDate ??
        toAnnualDate(new Date().getMonth() + 1, new Date().getDate()))
      : null,
});

export function TaskScheduleFields({ schedule, onChange }: Props) {
  const { days, monthlyNth, monthlyDates, onceDate, annualDate } = schedule;
  // Held in state because "Every week" with the days of a preset chosen is
  // indistinguishable from that preset in the schedule data.
  const [mode, setMode] = useState(() => getMode(schedule));
  const modeSelectId = useId();
  const previewId = useId();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const isSelectionEmpty =
    mode === SCHEDULE_MODE.ONCE
      ? !onceDate
      : mode === SCHEDULE_MODE.ANNUAL
        ? !annualDate
        : mode === SCHEDULE_MODE.DATE
          ? !monthlyDates?.length
          : days.length === 0 ||
            (mode === SCHEDULE_MODE.NTH_WEEKDAY && !monthlyNth?.length);
  const hasUserChoices =
    mode === SCHEDULE_MODE.DATE ||
    (!WEEKDAY_FREE_MODES.includes(mode) && !PRESET_DAYS[mode]);
  const [month, setMonth] = useState(() => new Date());
  const today = new Date();
  const [nextOccurrence] = isSelectionEmpty
    ? []
    : getNextOccurrences(schedule, today, 1);

  return (
    <>
      <div className="flex flex-col gap-1">
        <label htmlFor={modeSelectId} className="text-xs font-medium">
          Repeat
        </label>
        <Select
          id={modeSelectId}
          className="w-full"
          options={MODE_OPTIONS}
          optionIdentifier="value"
          optionDisplayKey="label"
          value={MODE_OPTIONS.find(option => option.value === mode)}
          onValueChange={({ value }) => {
            setMode(value);
            onChange(prev => switchMode(prev, value));
          }}
        />
      </div>
      {mode === SCHEDULE_MODE.ONCE && (
        <DatePicker
          aria-label="Date"
          value={onceDate ? fromDateKey(onceDate) : undefined}
          formatDate={formatOccurrenceDate}
          onValueChange={date =>
            onChange(prev => ({ ...prev, onceDate: toDateKey(date) }))
          }
        />
      )}
      {mode === SCHEDULE_MODE.ANNUAL && annualDate && (
        <DatePicker
          aria-label="Annual date"
          value={toLeapYearDate(annualDate)}
          startMonth={new Date(LEAP_YEAR, 0)}
          endMonth={new Date(LEAP_YEAR, 11)}
          formatDate={date =>
            `${MONTH_LABELS[date.getMonth()]} ${date.getDate()}`
          }
          formatCaption={date => MONTH_LABELS[date.getMonth()]}
          onValueChange={date =>
            onChange(prev => ({
              ...prev,
              annualDate: toAnnualDate(date.getMonth() + 1, date.getDate()),
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
      {!WEEKDAY_FREE_MODES.includes(mode) && !PRESET_DAYS[mode] && (
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
              <p className="font-medium">
                {mode === SCHEDULE_MODE.ONCE || mode === SCHEDULE_MODE.ANNUAL
                  ? describeDays(schedule)
                  : `Repeats ${describeDays(schedule)}`}
              </p>
              <p>
                Next: {formatOccurrenceDate(nextOccurrence)} ·{' '}
                {getRelativeDayLabel(nextOccurrence, today)}
              </p>
            </>
          ) : (
            <p>
              {mode === SCHEDULE_MODE.ONCE
                ? 'Pick today or a later date to preview.'
                : mode === SCHEDULE_MODE.DATE
                  ? 'Select at least one date to preview.'
                  : mode === SCHEDULE_MODE.NTH_WEEKDAY
                    ? 'Select at least one week and weekday to preview.'
                    : 'Select at least one weekday to preview.'}
            </p>
          )}
        </div>
        <div className="ml-auto flex shrink-0 gap-2">
          {hasUserChoices && (
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
          )}
          <Button
            size="sm"
            variant="outline"
            aria-expanded={isPreviewOpen}
            aria-controls={previewId}
            onClick={() => setIsPreviewOpen(open => !open)}
          >
            <CalendarDays size={14} />
            Preview
          </Button>
        </div>
      </div>
      {/* A 0fr to 1fr grid row animates the height of content whose size is unknown. */}
      <div
        id={previewId}
        inert={!isPreviewOpen}
        className={cn(
          'grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none',
          isPreviewOpen
            ? 'grid-rows-[1fr] opacity-100'
            : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <Calendar
            month={month}
            onMonthChange={setMonth}
            isHighlighted={date =>
              !isSelectionEmpty && occursOn(schedule, date)
            }
            className="self-center"
          />
        </div>
      </div>
    </>
  );
}
