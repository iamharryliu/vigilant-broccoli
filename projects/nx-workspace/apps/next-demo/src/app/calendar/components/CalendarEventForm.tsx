'use client';

import { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  TextArea,
  Flex,
  Text,
  Select,
} from '@radix-ui/themes';
import { toDatetimeLocal, toDateLocal } from '../../../lib/date-utils';

export interface CalendarEventFormData {
  title: string;
  description: string;
  start: string;
  end: string;
  allDay: boolean;
  color: string;
}

interface Props {
  initialData?: Partial<CalendarEventFormData>;
  onSubmit: (data: CalendarEventFormData) => void;
  onDelete?: () => void;
  onCancel: () => void;
  isEdit?: boolean;
}

const NO_COLOR = 'none';

const EVENT_COLORS = [
  { label: 'Default', value: NO_COLOR },
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Green', value: '#22c55e' },
  { label: 'Red', value: '#ef4444' },
  { label: 'Orange', value: '#f97316' },
  { label: 'Purple', value: '#a855f7' },
  { label: 'Pink', value: '#ec4899' },
  { label: 'Teal', value: '#14b8a6' },
];

export function CalendarEventForm({
  initialData,
  onSubmit,
  onDelete,
  onCancel,
  isEdit,
}: Props) {
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [description, setDescription] = useState(
    initialData?.description ?? '',
  );
  const [allDay, setAllDay] = useState(initialData?.allDay ?? false);
  const [start, setStart] = useState(
    initialData?.start
      ? initialData.allDay
        ? toDateLocal(initialData.start)
        : toDatetimeLocal(initialData.start)
      : '',
  );
  const [end, setEnd] = useState(
    initialData?.end
      ? initialData.allDay
        ? toDateLocal(initialData.end)
        : toDatetimeLocal(initialData.end)
      : '',
  );
  const [color, setColor] = useState(initialData?.color || NO_COLOR);

  useEffect(() => {
    if (initialData?.start)
      setStart(
        allDay
          ? toDateLocal(initialData.start)
          : toDatetimeLocal(initialData.start),
      );
    if (initialData?.end)
      setEnd(
        allDay
          ? toDateLocal(initialData.end)
          : toDatetimeLocal(initialData.end),
      );
    // intentionally only re-runs when allDay toggles, not on every initialData change
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
    onSubmit({
      title,
      description,
      start: startIso,
      end: endIso,
      allDay,
      color: color === NO_COLOR ? '' : color,
    });
  };

  const inputStyle: React.CSSProperties = {
    padding: '6px 10px',
    borderRadius: '6px',
    border: '1px solid var(--gray-6)',
    background: 'var(--color-background)',
    color: 'inherit',
    fontSize: '14px',
    width: '100%',
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
            placeholder="Event title"
            required
          />
        </div>

        <div>
          <Text size="1" weight="medium" as="p" mb="1">
            Description
          </Text>
          <TextArea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Optional description"
            rows={3}
          />
        </div>

        <Flex align="center" gap="2">
          <input
            type="checkbox"
            id="allDay"
            checked={allDay}
            onChange={e => setAllDay(e.target.checked)}
          />
          <Text size="2" asChild>
            <label htmlFor="allDay">All day</label>
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

        <div>
          <Text size="1" weight="medium" as="p" mb="1">
            Color
          </Text>
          <Select.Root value={color} onValueChange={setColor}>
            <Select.Trigger placeholder="Default" />
            <Select.Content>
              {EVENT_COLORS.map(c => (
                <Select.Item key={c.value} value={c.value}>
                  <Flex align="center" gap="2">
                    {c.value !== NO_COLOR && (
                      <span
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          background: c.value,
                          display: 'inline-block',
                        }}
                      />
                    )}
                    {c.label}
                  </Flex>
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </div>

        <Flex justify="between" gap="2" pt="2">
          <div>
            {isEdit && onDelete && (
              <Button
                type="button"
                color="red"
                variant="soft"
                onClick={onDelete}
                className="cursor-pointer"
              >
                Delete
              </Button>
            )}
          </div>
          <Flex gap="2">
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
              {isEdit ? 'Save' : 'Create'}
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </form>
  );
}
