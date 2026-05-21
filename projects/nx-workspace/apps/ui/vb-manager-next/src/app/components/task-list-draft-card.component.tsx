'use client';

import { Flex, Text, TextField, Select } from '@radix-ui/themes';
import { Button } from '@vigilant-broccoli/react-lib';
import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface TaskDraftItem {
  title: string;
}

export interface TaskListOption {
  id: string;
  title: string;
}

export type TaskListDraftStatus = 'draft' | 'creating' | 'created' | 'error';

interface TaskListDraftCardProps {
  drafts: TaskDraftItem[];
  status: TaskListDraftStatus;
  errorMessage?: string;
  createdSummary?: string;
  onCreate: (params: {
    tasks: TaskDraftItem[];
    targetListId?: string;
    newListTitle?: string;
  }) => void;
  onCancel: () => void;
}

const NEW_LIST_VALUE = '__new_list__';
const DEFAULT_NEW_LIST_TITLE = 'New list';
const TASKS_LISTS_API_PATH = '/api/tasks/lists';
const LOAD_LISTS_ERROR_MESSAGE = 'Failed to load task lists';

export const TaskListDraftCard = ({
  drafts,
  status,
  errorMessage,
  createdSummary,
  onCreate,
  onCancel,
}: TaskListDraftCardProps) => {
  const [items, setItems] = useState<TaskDraftItem[]>(drafts);
  const [taskLists, setTaskLists] = useState<TaskListOption[]>([]);
  const [listsLoading, setListsLoading] = useState(true);
  const [listsError, setListsError] = useState<string | null>(null);
  const [selectedListId, setSelectedListId] = useState<string>(NEW_LIST_VALUE);
  const [newListTitle, setNewListTitle] = useState<string>(
    DEFAULT_NEW_LIST_TITLE,
  );

  const isReadOnly = status === 'creating' || status === 'created';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(TASKS_LISTS_API_PATH);
        if (!res.ok) throw new Error(LOAD_LISTS_ERROR_MESSAGE);
        const data = await res.json();
        if (cancelled) return;
        const lists: TaskListOption[] = (data.taskLists ?? []).map(
          (l: { id: string; title: string }) => ({ id: l.id, title: l.title }),
        );
        setTaskLists(lists);
        if (lists.length > 0) {
          setSelectedListId(lists[0].id);
        }
      } catch (e) {
        if (!cancelled) {
          setListsError(
            e instanceof Error ? e.message : LOAD_LISTS_ERROR_MESSAGE,
          );
        }
      } finally {
        if (!cancelled) setListsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleTitleChange = (index: number, value: string) => {
    setItems(prev =>
      prev.map((item, i) => (i === index ? { ...item, title: value } : item)),
    );
  };

  const handleRemove = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreate = () => {
    const cleaned = items
      .map(i => ({ title: i.title.trim() }))
      .filter(i => i.title.length > 0);
    if (cleaned.length === 0) return;

    if (selectedListId === NEW_LIST_VALUE) {
      const title = newListTitle.trim() || DEFAULT_NEW_LIST_TITLE;
      onCreate({ tasks: cleaned, newListTitle: title });
    } else {
      onCreate({ tasks: cleaned, targetListId: selectedListId });
    }
  };

  const canCreate =
    !isReadOnly &&
    items.some(i => i.title.trim().length > 0) &&
    (selectedListId !== NEW_LIST_VALUE || newListTitle.trim().length > 0);

  return (
    <Flex direction="column" gap="2" style={{ marginTop: '0.5rem' }}>
      <Text size="2" weight="medium">
        Google Tasks
      </Text>

      <Flex direction="column" gap="1">
        {items.map((item, index) => (
          <Flex key={index} gap="2" align="center">
            <TextField.Root
              placeholder="Task title"
              value={item.title}
              onChange={e => handleTitleChange(index, e.target.value)}
              disabled={isReadOnly}
              style={{ flex: 1 }}
            />
            <Button
              variant="secondary"
              onClick={() => handleRemove(index)}
              disabled={isReadOnly}
              aria-label="Remove task"
            >
              <Trash2 size={14} />
            </Button>
          </Flex>
        ))}
        {items.length === 0 && (
          <Text size="1" color="gray">
            No tasks remaining.
          </Text>
        )}
      </Flex>

      <Flex direction="column" gap="1" style={{ marginTop: '0.5rem' }}>
        <Text size="1" color="gray">
          Task list
        </Text>
        <Select.Root
          value={selectedListId}
          onValueChange={setSelectedListId}
          disabled={isReadOnly || listsLoading}
        >
          <Select.Trigger
            placeholder={listsLoading ? 'Loading lists...' : 'Select a list'}
          />
          <Select.Content>
            {taskLists.map(list => (
              <Select.Item key={list.id} value={list.id}>
                {list.title}
              </Select.Item>
            ))}
            <Select.Item value={NEW_LIST_VALUE}>Create new list...</Select.Item>
          </Select.Content>
        </Select.Root>
        {selectedListId === NEW_LIST_VALUE && (
          <TextField.Root
            placeholder="New list name"
            value={newListTitle}
            onChange={e => setNewListTitle(e.target.value)}
            disabled={isReadOnly}
          />
        )}
        {listsError && (
          <Text size="1" color="red">
            {listsError}
          </Text>
        )}
      </Flex>

      {status === 'error' && errorMessage && (
        <Text size="1" color="red">
          {errorMessage}
        </Text>
      )}

      {status === 'created' && (
        <Text size="1" color="green">
          {createdSummary || 'Tasks created.'}
        </Text>
      )}

      {status !== 'created' && (
        <Flex gap="2">
          <Button onClick={handleCreate} disabled={!canCreate}>
            {status === 'creating' ? 'Creating...' : 'Create tasks'}
          </Button>
          <Button variant="secondary" onClick={onCancel} disabled={isReadOnly}>
            Cancel
          </Button>
        </Flex>
      )}
    </Flex>
  );
};
