'use client';

import { useState, useEffect } from 'react';
import { Button, Flex, Text, TextField, TextArea } from '@radix-ui/themes';
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

export function LeisureCalendarDropForm({
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
    // intentionally only re-runs when allDay toggles
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
          <TextField.Root
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <Text size="1" weight="medium" as="p" mb="1">
            Notes
          </Text>
          <TextArea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
          />
        </div>

        <Flex align="center" gap="2">
          <input
            type="checkbox"
            id="allDayDrop"
            checked={allDay}
            onChange={e => setAllDay(e.target.checked)}
          />
          <Text size="2" asChild>
            <label htmlFor="allDayDrop">All day</label>
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
            variant="soft"
            color="gray"
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
