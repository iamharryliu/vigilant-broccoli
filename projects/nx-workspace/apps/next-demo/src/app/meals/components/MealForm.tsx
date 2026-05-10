'use client';

import { useState } from 'react';
import {
  Button,
  TextField,
  TextArea,
  Flex,
  Text,
  Select,
} from '@radix-ui/themes';
import { MEAL_CATEGORIES, MealCategory } from '../../../lib/types';

export interface MealFormData {
  title: string;
  description: string;
  category: MealCategory;
  servings: number | null;
}

interface Props {
  initialData?: Partial<MealFormData>;
  onSubmit: (data: MealFormData) => void;
  onDelete?: () => void;
  onCancel: () => void;
  isEdit?: boolean;
}

export function MealForm({
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
  const [category, setCategory] = useState<MealCategory>(
    initialData?.category ?? 'Dinner',
  );
  const [servings, setServings] = useState(
    initialData?.servings?.toString() ?? '',
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      category,
      servings: servings ? parseInt(servings) : null,
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
            placeholder="e.g. Spaghetti Bolognese"
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
            placeholder="Ingredients, notes, recipe link..."
            rows={2}
          />
        </div>

        <div>
          <Text size="1" weight="medium" as="p" mb="1">
            Category
          </Text>
          <Select.Root
            value={category}
            onValueChange={v => setCategory(v as MealCategory)}
          >
            <Select.Trigger />
            <Select.Content>
              {MEAL_CATEGORIES.map(c => (
                <Select.Item key={c} value={c}>
                  {c}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </div>

        <div>
          <Text size="1" weight="medium" as="p" mb="1">
            Servings (optional)
          </Text>
          <TextField.Root
            type="number"
            min="1"
            placeholder="e.g. 4"
            value={servings}
            onChange={e => setServings(e.target.value)}
          />
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
              {isEdit ? 'Save' : 'Add'}
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </form>
  );
}
