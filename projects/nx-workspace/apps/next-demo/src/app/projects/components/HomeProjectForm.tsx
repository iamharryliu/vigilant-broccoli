'use client';

import { useState } from 'react';
import { Flex, Text } from '@radix-ui/themes';
import { Button, Input, Select, Textarea } from '@vigilant-broccoli/react-lib';
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
          <Input
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
            options={PROJECT_CATEGORIES as unknown as ProjectCategory[]}
          />
        </div>

        <div>
          <Text size="1" weight="medium" as="p" mb="1">
            Status
          </Text>
          <Select
            selectedOption={status}
            setValue={setStatus}
            options={PROJECT_STATUSES as unknown as ProjectStatus[]}
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
