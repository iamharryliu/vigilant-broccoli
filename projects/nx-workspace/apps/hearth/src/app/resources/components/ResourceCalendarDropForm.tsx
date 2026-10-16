'use client';

import { useState } from 'react';
import { type DateRange } from 'react-day-picker';

import { Button, Input, Textarea, Text } from '@vigilant-broccoli/react-lib';
import { DateRangePicker } from '../../calendar/components/DateRangePicker';
import { toYmd } from '../../../lib/date-utils';
import { ResourceBookingFormData } from './ResourceBookingForm';

interface Props {
  initialData: ResourceBookingFormData;
  onConfirm: (data: ResourceBookingFormData) => void;
  onCancel: () => void;
}

export function ResourceCalendarDropForm({
  initialData,
  onConfirm,
  onCancel,
}: Props) {
  const [title, setTitle] = useState(initialData.title);
  const [description, setDescription] = useState(initialData.description);
  const [range, setRange] = useState<DateRange | undefined>({
    from: new Date(`${initialData.startDate}T00:00:00`),
    to: new Date(`${initialData.endDate}T00:00:00`),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!range?.from) return;
    onConfirm({
      ...initialData,
      title,
      description,
      startDate: toYmd(range.from),
      endDate: toYmd(range.to ?? range.from),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-3 mt-2">
        <div>
          <Text size="1" weight="medium" as="p" mb="1">
            Booking Title
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

        <div>
          <Text size="1" weight="medium" as="p" mb="1">
            Dates
          </Text>
          <DateRangePicker value={range} onChange={setRange} />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!range?.from}
            className="cursor-pointer"
          >
            Book Resource
          </Button>
        </div>
      </div>
    </form>
  );
}
