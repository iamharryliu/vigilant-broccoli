'use client';

import { useState } from 'react';
import { Button, Flex, Text, TextField, TextArea } from '@radix-ui/themes';
import { toDateLocal } from '../../../lib/date-utils';
import { ResourceBookingFormData } from './ResourceBookingForm';

const inputStyle: React.CSSProperties = {
  padding: '6px 10px',
  borderRadius: '6px',
  border: '1px solid var(--gray-6)',
  background: 'var(--color-background)',
  color: 'inherit',
  fontSize: '14px',
  width: '100%',
};

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
  const [startDate, setStartDate] = useState(initialData.startDate);
  const [endDate, setEndDate] = useState(initialData.endDate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({ ...initialData, title, description, startDate, endDate });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap="3" mt="2">
        <div>
          <Text size="1" weight="medium" as="p" mb="1">
            Booking Title
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

        <Flex gap="3">
          <div style={{ flex: 1 }}>
            <Text size="1" weight="medium" as="p" mb="1">
              Start Date
            </Text>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              required
              style={inputStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <Text size="1" weight="medium" as="p" mb="1">
              End Date
            </Text>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={e => setEndDate(e.target.value)}
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
            Book Resource
          </Button>
        </Flex>
      </Flex>
    </form>
  );
}
