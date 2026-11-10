'use client';

import { Repeat, RotateCcw } from 'lucide-react';
import { Button } from '@vigilant-broccoli/react-lib';
import {
  ALL_DAYS,
  MONTHLY_ORDINALS,
  RecurringTask,
  WEEKDAYS,
  isEveryDay,
} from './tasks.utils';

type TaskSchedule = Pick<RecurringTask, 'days' | 'monthlyNth'>;

type Props = {
  schedule: TaskSchedule;
  onChange: (update: (prev: TaskSchedule) => TaskSchedule) => void;
};

const toggleValue = (values: number[], value: number) =>
  values.includes(value) ? values.filter(v => v !== value) : [...values, value];

const ChipGroup = ({
  options,
  selected,
  onToggle,
}: {
  options: { value: number; label: string }[];
  selected: number[];
  onToggle: (value: number) => void;
}) => (
  <div className="flex flex-wrap gap-1">
    {options.map(({ value, label }) => (
      <Button
        key={value}
        size="sm"
        variant={selected.includes(value) ? 'default' : 'outline'}
        className="w-12"
        onClick={() => onToggle(value)}
      >
        {label}
      </Button>
    ))}
  </div>
);

const ORDINAL_OPTIONS = MONTHLY_ORDINALS.map(({ nth, label }) => ({
  value: nth,
  label,
}));
const WEEKDAY_OPTIONS = WEEKDAYS.map(({ day, label }) => ({
  value: day,
  label,
}));

export function TaskScheduleFields({ schedule, onChange }: Props) {
  const { days, monthlyNth } = schedule;

  const setMonthly = (monthly: boolean) =>
    onChange(prev => ({
      ...prev,
      monthlyNth: monthly ? (prev.monthlyNth ?? []) : null,
    }));

  return (
    <>
      <div className="flex gap-1">
        <Button
          size="sm"
          variant={monthlyNth ? 'outline' : 'default'}
          onClick={() => setMonthly(false)}
        >
          Weekly
        </Button>
        <Button
          size="sm"
          variant={monthlyNth ? 'default' : 'outline'}
          onClick={() => setMonthly(true)}
        >
          Monthly
        </Button>
      </div>
      <div className="flex gap-2">
        {!monthlyNth && (
          <Button
            size="sm"
            variant={isEveryDay(days) ? 'default' : 'outline'}
            onClick={() => onChange(prev => ({ ...prev, days: ALL_DAYS }))}
          >
            <Repeat size={14} />
            Daily
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          disabled={days.length === 0 && !monthlyNth?.length}
          onClick={() =>
            onChange(prev => ({
              days: [],
              monthlyNth: prev.monthlyNth ? [] : null,
            }))
          }
        >
          <RotateCcw size={14} />
          Reset
        </Button>
      </div>
      {monthlyNth && (
        <ChipGroup
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
      <ChipGroup
        options={WEEKDAY_OPTIONS}
        selected={days}
        onToggle={day =>
          onChange(prev => ({ ...prev, days: toggleValue(prev.days, day) }))
        }
      />
    </>
  );
}
