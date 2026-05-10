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
import {
  PROJECT_CATEGORIES,
  PROJECT_STATUSES,
  ProjectCategory,
  ProjectStatus,
} from '../../../lib/types';

export interface HomeProjectFormData {
  title: string;
  description: string;
  category: ProjectCategory;
  status: ProjectStatus;
}

interface Props {
  initialData?: Partial<HomeProjectFormData>;
  onSubmit: (data: HomeProjectFormData) => void;
  onDelete?: () => void;
  onCancel: () => void;
  isEdit?: boolean;
}

export function HomeProjectForm({
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
  const [category, setCategory] = useState<ProjectCategory>(
    initialData?.category ?? 'Other',
  );
  const [status, setStatus] = useState<ProjectStatus>(
    initialData?.status ?? 'Todo',
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, description, category, status });
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
            placeholder="e.g. Build shelf in garage"
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
            placeholder="Optional notes"
            rows={2}
          />
        </div>

        <div>
          <Text size="1" weight="medium" as="p" mb="1">
            Category
          </Text>
          <Select.Root
            value={category}
            onValueChange={v => setCategory(v as ProjectCategory)}
          >
            <Select.Trigger />
            <Select.Content>
              {PROJECT_CATEGORIES.map(c => (
                <Select.Item key={c} value={c}>
                  {c}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </div>

        <div>
          <Text size="1" weight="medium" as="p" mb="1">
            Status
          </Text>
          <Select.Root
            value={status}
            onValueChange={v => setStatus(v as ProjectStatus)}
          >
            <Select.Trigger />
            <Select.Content>
              {PROJECT_STATUSES.map(s => (
                <Select.Item key={s} value={s}>
                  {s}
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
              {isEdit ? 'Save' : 'Add'}
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </form>
  );
}
