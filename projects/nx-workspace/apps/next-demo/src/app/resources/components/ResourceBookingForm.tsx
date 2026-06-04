'use client';

import { useState } from 'react';
import { Flex, Text } from '@radix-ui/themes';
import { Button, Input, Select, Textarea } from '@vigilant-broccoli/react-lib';
import { Resource } from '../../../lib/types';

export interface ResourceBookingFormData {
  resourceId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
}

interface Props {
  resources: Resource[];
  initialData?: Partial<ResourceBookingFormData>;
  onSubmit: (data: ResourceBookingFormData) => void;
  onDelete?: () => void;
  onCancel: () => void;
  isEdit?: boolean;
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

export function ResourceBookingForm({
  resources,
  initialData,
  onSubmit,
  onDelete,
  onCancel,
  isEdit,
}: Props) {
  const [resourceId, setResourceId] = useState(initialData?.resourceId ?? '');
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [description, setDescription] = useState(
    initialData?.description ?? '',
  );
  const [startDate, setStartDate] = useState(initialData?.startDate ?? '');
  const [endDate, setEndDate] = useState(initialData?.endDate ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ resourceId, title, description, startDate, endDate });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap="3" mt="2">
        <div>
          <Text size="1" weight="medium" as="p" mb="1">
            Resource
          </Text>
          <Select
            selectedOption={resources.find(r => r.id === resourceId)}
            setValue={r => setResourceId(r.id)}
            options={resources}
            optionIdenfifier="id"
            optionDisplayKey="name"
            placeholder="Select a resource"
            triggerClassName="w-full"
          />
        </div>

        <div>
          <Text size="1" weight="medium" as="p" mb="1">
            Title
          </Text>
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Team offsite, Weekend trip"
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
            placeholder="Optional notes"
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

        <Flex justify="between" gap="2" pt="2">
          <div>
            {isEdit && onDelete && (
              <Button type="button" variant="destructive" onClick={onDelete}>
                Delete
              </Button>
            )}
          </div>
          <Flex gap="2">
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!resourceId}>
              {isEdit ? 'Save' : 'Book'}
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </form>
  );
}
