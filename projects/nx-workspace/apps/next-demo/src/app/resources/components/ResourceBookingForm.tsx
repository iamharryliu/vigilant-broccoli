'use client';

import { useState } from 'react';
import {
  Button,
  Flex,
  Select,
  Text,
  TextArea,
  TextField,
} from '@radix-ui/themes';
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
          <Select.Root value={resourceId} onValueChange={setResourceId}>
            <Select.Trigger
              placeholder="Select a resource"
              style={{ width: '100%' }}
            />
            <Select.Content>
              {resources.map(r => (
                <Select.Item key={r.id} value={r.id}>
                  {r.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </div>

        <div>
          <Text size="1" weight="medium" as="p" mb="1">
            Title
          </Text>
          <TextField.Root
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
          <TextArea
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
            <Button
              type="submit"
              disabled={!resourceId}
              className="cursor-pointer"
            >
              {isEdit ? 'Save' : 'Book'}
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </form>
  );
}
