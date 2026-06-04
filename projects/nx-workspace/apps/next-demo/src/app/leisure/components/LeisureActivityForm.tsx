'use client';

import { useState } from 'react';
import { Flex, Text } from '@radix-ui/themes';
import { Button, Input, Select, Textarea } from '@vigilant-broccoli/react-lib';
import { LEISURE_CATEGORIES, LeisureCategory } from '../../../lib/types';

export interface LeisureActivityFormData {
  title: string;
  description: string;
  category: LeisureCategory;
}

interface Props {
  initialData?: Partial<LeisureActivityFormData>;
  onSubmit: (data: LeisureActivityFormData) => void;
  onDelete?: () => void;
  onCancel: () => void;
  isEdit?: boolean;
}

export function LeisureActivityForm({
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
  const [category, setCategory] = useState<LeisureCategory>(
    initialData?.category ?? 'Other',
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, description, category });
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
            placeholder="e.g. Severance Season 2"
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
            placeholder="Optional notes"
            rows={2}
          />
        </div>

        <div>
          <Text size="1" weight="medium" as="p" mb="1">
            Category
          </Text>
          <Select
            selectedOption={category}
            setValue={setCategory}
            options={LEISURE_CATEGORIES as unknown as LeisureCategory[]}
          />
        </div>

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
            <Button type="submit">{isEdit ? 'Save' : 'Add'}</Button>
          </Flex>
        </Flex>
      </Flex>
    </form>
  );
}
