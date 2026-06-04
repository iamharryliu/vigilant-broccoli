'use client';

import { useState } from 'react';
import { Flex, Text } from '@radix-ui/themes';
import { Button, Input, Select, Textarea } from '@vigilant-broccoli/react-lib';
import { RESOURCE_CATEGORIES, ResourceCategory } from '../../../lib/types';

export interface ResourceFormData {
  name: string;
  description: string;
  category: ResourceCategory;
  quantity: number;
}

interface Props {
  initialData?: Partial<ResourceFormData>;
  onSubmit: (data: ResourceFormData) => void;
  onDelete?: () => void;
  onCancel: () => void;
  isEdit?: boolean;
}

export function ResourceForm({
  initialData,
  onSubmit,
  onDelete,
  onCancel,
  isEdit,
}: Props) {
  const [name, setName] = useState(initialData?.name ?? '');
  const [description, setDescription] = useState(
    initialData?.description ?? '',
  );
  const [category, setCategory] = useState<ResourceCategory>(
    initialData?.category ?? 'Other',
  );
  const [quantity, setQuantity] = useState(initialData?.quantity ?? 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, description, category, quantity });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap="3" mt="2">
        <div>
          <Text size="1" weight="medium" as="p" mb="1">
            Name
          </Text>
          <Input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Conference Room A, Company Car"
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
            placeholder="Optional notes about this resource"
            rows={2}
          />
        </div>

        <Flex gap="3">
          <div style={{ flex: 1 }}>
            <Text size="1" weight="medium" as="p" mb="1">
              Category
            </Text>
            <Select
              selectedOption={category}
              setValue={setCategory}
              options={RESOURCE_CATEGORIES as unknown as ResourceCategory[]}
              triggerClassName="w-full"
            />
          </div>

          <div style={{ width: '110px' }}>
            <Text size="1" weight="medium" as="p" mb="1">
              Quantity
            </Text>
            <Input
              type="number"
              min="1"
              value={quantity.toString()}
              onChange={e =>
                setQuantity(Math.max(1, parseInt(e.target.value) || 1))
              }
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
            <Button type="submit">{isEdit ? 'Save' : 'Add'}</Button>
          </Flex>
        </Flex>
      </Flex>
    </form>
  );
}
