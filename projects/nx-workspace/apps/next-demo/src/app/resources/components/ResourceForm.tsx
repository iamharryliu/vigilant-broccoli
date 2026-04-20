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
          <TextField.Root
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
          <TextArea
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
            <Select.Root
              value={category}
              onValueChange={v => setCategory(v as ResourceCategory)}
            >
              <Select.Trigger style={{ width: '100%' }} />
              <Select.Content>
                {RESOURCE_CATEGORIES.map(c => (
                  <Select.Item key={c} value={c}>
                    {c}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </div>

          <div style={{ width: '110px' }}>
            <Text size="1" weight="medium" as="p" mb="1">
              Quantity
            </Text>
            <TextField.Root
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
              {isEdit ? 'Save' : 'Add'}
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </form>
  );
}
