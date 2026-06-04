'use client';

import { useState, useEffect } from 'react';
import { Flex, Text } from '@radix-ui/themes';
import { Button, Input, Textarea } from '@vigilant-broccoli/react-lib';
import { CalendarEventFormData } from '../../calendar/components/CalendarEventForm';
import { toDatetimeLocal, toDateLocal } from '../../../lib/date-utils';

interface Props {
  initialData: CalendarEventFormData;
  onConfirm: (data: CalendarEventFormData) => void;
  onCancel: () => void;
}

const inputStyle: React.CSSProperties = {
  padding: '6px 10px',
  borderRadius: '6px',
  border: '1px solid var(--gray-6)',
  background: 'var(--color-background)',
  color: 'inherit',
  fontSize: '14px',
  width: '100%',
};

export function MealCalendarDropForm({
  initialData,
  onConfirm,
  onCancel,
}: Props) {
  const [title, setTitle] = useState(initialData.title);
  const [description, setDescription] = useState(initialData.description);
  const [allDay, setAllDay] = useState(initialData.allDay);
  const [start, setStart] = useState(
    initialData.allDay
      ? toDateLocal(initialData.start)
      : toDatetimeLocal(initialData.start),
  );
  const [end, setEnd] = useState(
    initialData.allDay
      ? toDateLocal(initialData.end)
      : toDatetimeLocal(initialData.end),
  );

  useEffect(() => {
    setStart(
      allDay
        ? toDateLocal(initialData.start)
        : toDatetimeLocal(initialData.start),
    );
    setEnd(
      allDay ? toDateLocal(initialData.end) : toDatetimeLocal(initialData.end),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDay]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const startIso = allDay
      ? new Date(start + 'T00:00:00').toISOString()
      : new Date(start).toISOString();
    const endIso = allDay
      ? new Date(end + 'T00:00:00').toISOString()
      : new Date(end).toISOString();
    onConfirm({
      ...initialData,
      title,
      description,
      start: startIso,
      end: endIso,
      allDay,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap="3" mt="2">
        <div>
          <Text size="1" weight="medium" as="p" mb="1">
            Title
          </Text>
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <Text size="1" weight="medium" as="p" mb="1">
            Notes
          </Text>
          <Textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
          />
        </div>

        <Flex align="center" gap="2">
          <input
            type="checkbox"
            id="allDayMeal"
            checked={allDay}
            onChange={e => setAllDay(e.target.checked)}
          />
          <Text size="2" asChild>
            <label htmlFor="allDayMeal">All day</label>
          </Text>
        </Flex>

        <Flex gap="3">
          <div style={{ flex: 1 }}>
            <Text size="1" weight="medium" as="p" mb="1">
              Start
            </Text>
            <input
              type={allDay ? 'date' : 'datetime-local'}
              value={start}
              onChange={e => setStart(e.target.value)}
              required
              style={inputStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <Text size="1" weight="medium" as="p" mb="1">
              End
            </Text>
            <input
              type={allDay ? 'date' : 'datetime-local'}
              value={end}
              onChange={e => setEnd(e.target.value)}
              required
              style={inputStyle}
            />
          </div>
        </Flex>

        <Flex justify="end" gap="2" pt="2">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button type="submit" className="cursor-pointer">
            Add to Calendar
          </Button>
        </Flex>
      </Flex>
    </form>
  );
}
