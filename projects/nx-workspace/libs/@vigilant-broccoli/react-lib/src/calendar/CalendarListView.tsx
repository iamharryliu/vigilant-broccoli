'use client';

import { ReactNode, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../utils/cn';
import { Button } from '../components/Button';
import { Text } from '../components/Text';
import { CalendarListSkeleton } from './CalendarListSkeleton';
import { CalendarEventInput } from './calendar.types';
import {
  addMonths,
  formatDayHeader,
  formatMonthYear,
  formatTime,
  groupEventsByDay,
  isToday,
  startOfMonth,
  toDate,
} from './date.utils';

const DEFAULT_EVENT_COLOR = 'var(--accent-9, #3b82f6)';
const ALL_DAY_LABEL = 'All day';
const TODAY_LABEL = 'Today';
const DEFAULT_EMPTY_TEXT = 'No events';

type Props = {
  events: CalendarEventInput[];
  initialDate?: Date;
  onEventClick?: (id: string) => void;
  emptyContent?: ReactNode;
  className?: string;
  loading?: boolean;
};

function EventRow({
  event,
  onClick,
}: {
  event: CalendarEventInput;
  onClick?: (id: string) => void;
}) {
  const color = event.color || DEFAULT_EVENT_COLOR;
  const time = event.allDay ? ALL_DAY_LABEL : formatTime(toDate(event.start));
  const clickable = Boolean(onClick);

  return (
    <button
      type="button"
      disabled={!clickable}
      onClick={() => onClick?.(event.id)}
      className={cn(
        'flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors',
        clickable && 'hover:bg-accent cursor-pointer',
      )}
    >
      <span
        aria-hidden
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      <Text size="1" color="gray" className="w-20 shrink-0 tabular-nums">
        {time}
      </Text>
      <Text size="2" weight="medium" className="truncate">
        {event.title}
      </Text>
    </button>
  );
}

export function CalendarListView({
  events,
  initialDate,
  onEventClick,
  emptyContent,
  className,
  loading = false,
}: Props) {
  const [viewDate, setViewDate] = useState(() =>
    startOfMonth(initialDate ?? new Date()),
  );

  const groups = useMemo(
    () => groupEventsByDay(events, viewDate),
    [events, viewDate],
  );

  return (
    <div className={cn('flex w-full flex-col gap-3', className)}>
      <div className="flex items-center justify-between">
        <Text size="4" weight="bold">
          {formatMonthYear(viewDate)}
        </Text>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Previous month"
            onClick={() => setViewDate(d => addMonths(d, -1))}
          >
            <ChevronLeft size={16} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewDate(startOfMonth(new Date()))}
          >
            {TODAY_LABEL}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Next month"
            onClick={() => setViewDate(d => addMonths(d, 1))}
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      {loading ? (
        <CalendarListSkeleton />
      ) : groups.length === 0 ? (
        <div className="py-8 text-center">
          {emptyContent ?? (
            <Text size="2" color="gray">
              {DEFAULT_EMPTY_TEXT}
            </Text>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {groups.map(group => (
            <div key={group.key} className="flex flex-col gap-1">
              <div className="flex items-baseline gap-2">
                <Text
                  size="2"
                  weight="bold"
                  color={isToday(group.date) ? 'blue' : undefined}
                >
                  {formatDayHeader(group.date)}
                </Text>
                {isToday(group.date) && (
                  <Text size="1" color="blue">
                    {TODAY_LABEL}
                  </Text>
                )}
              </div>
              <div className="flex flex-col">
                {group.events.map(event => (
                  <EventRow
                    key={event.id}
                    event={event}
                    onClick={onEventClick}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
