'use client';

import { useState } from 'react';
import { Popover } from '@radix-ui/themes';
import { DayPicker, type DateRange } from 'react-day-picker';
import 'react-day-picker/style.css';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@vigilant-broccoli/react-lib';

const PICK_DATE_LABEL = 'Pick a date';
const DATE_LABEL_FORMAT: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
};

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat(undefined, DATE_LABEL_FORMAT).format(date);

export const toMidnight = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

const formatRangeLabel = (range?: DateRange) => {
  if (!range?.from) return PICK_DATE_LABEL;
  if (!range.to || range.to.getTime() === range.from.getTime()) {
    return formatDate(range.from);
  }
  return `${formatDate(range.from)} - ${formatDate(range.to)}`;
};

interface Props {
  value?: DateRange;
  onChange: (range: DateRange | undefined) => void;
}

export function DateRangePicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start gap-2 cursor-pointer"
        >
          <CalendarIcon size={16} />
          {formatRangeLabel(value)}
        </Button>
      </Popover.Trigger>
      <Popover.Content align="start" style={{ padding: 0 }}>
        <DayPicker
          mode="range"
          defaultMonth={value?.from}
          selected={value}
          onSelect={range => {
            onChange(range);
            if (range?.from && range?.to) setOpen(false);
          }}
        />
      </Popover.Content>
    </Popover.Root>
  );
}
