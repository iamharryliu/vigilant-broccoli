'use client';

import { useState } from 'react';
import { type DateRange } from 'react-day-picker';

import {
  Button,
  Input,
  Select,
  Textarea,
  Text,
} from '@vigilant-broccoli/react-lib';
import { DateRangePicker, toMidnight } from './DateRangePicker';

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
  const [range, setRange] = useState<DateRange | undefined>(
    initialData?.start
      ? {
          from: new Date(initialData.start),
          to: initialData.end ? new Date(initialData.end) : undefined,
        }
      : undefined,
  );
  const [color, setColor] = useState(initialData?.color || NO_COLOR);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!range?.from) return;
    onSubmit({
      title,
      description,
      start: toMidnight(range.from).toISOString(),
      end: toMidnight(range.to ?? range.from).toISOString(),
      allDay: true,
      color: color === NO_COLOR ? '' : color,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-3 mt-2">
        <div>
          <Text size="1" weight="medium" as="p" mb="1">
            Title
          </Text>
          <Input
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
          <Textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Optional description"
            rows={3}
          />
        </div>

        <div>
          <Text size="1" weight="medium" as="p" mb="1">
            Dates
          </Text>
          <DateRangePicker value={range} onChange={setRange} />
        </div>

        <div>
          <Text size="1" weight="medium" as="p" mb="1">
            Color
          </Text>
          <Select
            selectedOption={EVENT_COLORS.find(c => c.value === color)}
            setValue={c => setColor(c.value)}
            options={EVENT_COLORS}
            optionIdenfifier="value"
            optionDisplayKey="label"
            placeholder="Default"
            renderItem={c => (
              <div className="flex items-center gap-2">
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
              </div>
            )}
          />
        </div>

        <div className="flex justify-between gap-2 pt-2">
          <div>
            {isEdit && onDelete && (
              <Button type="button" variant="destructive" onClick={onDelete}>
                Delete
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!range?.from}>
              {isEdit ? 'Save' : 'Create'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
