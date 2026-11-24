'use client';

import { CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../utils/cn';
import { Button } from './Button';
import { Calendar } from './Calendar';
import { Popover } from './Popover';

const DEFAULT_PLACEHOLDER = 'Pick a date';

const formatDefault = (date: Date) =>
  date.toLocaleDateString(undefined, { dateStyle: 'medium' });

export type DatePickerProps = {
  value?: Date;
  onValueChange: (date: Date) => void;
  placeholder?: string;
  /** Text shown in the trigger for the selected date. */
  formatDate?: (date: Date) => string;
  /** Bounds the months the calendar can page through. */
  startMonth?: Date;
  endMonth?: Date;
  /** Caption above the grid, e.g. the month name alone for a yearless date. */
  formatCaption?: (month: Date) => string;
  disabled?: boolean;
  className?: string;
  id?: string;
  'aria-label'?: string;
};

/**
 * Date picker styled like shadcn/ui's: an outline button that opens a
 * `Calendar` in a popover and closes once a day is chosen.
 */
export function DatePicker({
  value,
  onValueChange,
  placeholder = DEFAULT_PLACEHOLDER,
  formatDate = formatDefault,
  startMonth,
  endMonth,
  formatCaption,
  disabled,
  className,
  id,
  'aria-label': ariaLabel,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger>
        <Button
          id={id}
          type="button"
          variant="outline"
          aria-label={ariaLabel}
          disabled={disabled}
          className={cn(
            'w-full justify-start font-normal',
            !value && 'text-muted-foreground',
            className,
          )}
        >
          <CalendarIcon size={16} />
          {value ? formatDate(value) : placeholder}
        </Button>
      </Popover.Trigger>
      <Popover.Content align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value}
          defaultMonth={value}
          startMonth={startMonth}
          endMonth={endMonth}
          formatters={formatCaption && { formatCaption }}
          onSelect={date => {
            if (!date) return;
            onValueChange(date);
            setOpen(false);
          }}
        />
      </Popover.Content>
    </Popover.Root>
  );
}
