'use client';

import { Card, Flex, Text, Select, Button } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import { useSession, signIn } from '../../lib/auth-client';
import { GoogleTasksComponent } from './google-tasks.component';
import { CardSkeleton } from './skeleton.component';

interface TaskList {
  id: string;
  title: string;
}

export const TaskListSelectorComponent = () => {
  const { data: session, isPending } = useSession();
  const isAuthenticated = !!session?.user;
  const [taskLists, setTaskLists] = useState<TaskList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTaskLists();
    } else if (!isPending) {
      setLoading(false);
    }
  }, [isAuthenticated, isPending]);

  const fetchTaskLists = async () => {
    try {
      const response = await fetch('/api/tasks/lists', {
        credentials: 'include',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch task lists');
      }

      setTaskLists(data.taskLists);
      const nonDefaultList = data.taskLists.find((list: TaskList) => list.id !== '@default');
      if (nonDefaultList) {
        setSelectedListId(nonDefaultList.id);
      }
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch task lists');
      setLoading(false);
      console.error('Task lists fetch error:', err);
    }
  };

  if (isPending || (isAuthenticated && loading)) {
    return <CardSkeleton title="Task List" rows={3} />;
  }

  if (!isAuthenticated) {
    return (
      <Card className="w-full">
        <Flex direction="column" gap="3" p="4">
          <Flex justify="between" align="center">
            <Text size="5" weight="bold">Task List</Text>
            <Button onClick={() => signIn.social({ provider: 'google' })} size="2">
              Sign in with Google
            </Button>
          </Flex>
          <Text size="2" color="gray">
            Sign in to view your Google Tasks
          </Text>
        </Flex>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <Flex direction="column" gap="4" p="4">
          <Text size="5" weight="bold">Task List</Text>
          <Text color="red">{error}</Text>
        </Flex>
      </Card>
    );
  }

  if (taskLists.length === 0) {
    return (
      <Card className="w-full">
        <Flex direction="column" gap="4" p="4">
          <Text size="5" weight="bold">Task List</Text>
          <Text color="gray">No task lists found</Text>
        </Flex>
      </Card>
    );
  }

  return (
    <Flex direction="column" gap="4">
      <Card className="w-full">
        <Flex direction="column" gap="3" p="4">
          <Text size="3" weight="bold">Select Task List</Text>
          <Select.Root value={selectedListId} onValueChange={setSelectedListId}>
            <Select.Trigger placeholder="Choose a task list..." />
            <Select.Content>
              {taskLists
                .filter((list) => list.id !== '@default')
                .map((list) => (
                  <Select.Item key={list.id} value={list.id}>
                    {list.title}
                  </Select.Item>
                ))}
            </Select.Content>
          </Select.Root>
        </Flex>
      </Card>

      {selectedListId && <GoogleTasksComponent taskListId={selectedListId} />}
    </Flex>
  );
};
