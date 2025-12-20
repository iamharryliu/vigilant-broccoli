'use client';

import { Card, Flex, Text, Table, Code, Button, IconButton } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { CopyIcon } from '@radix-ui/react-icons';
import { API_ENDPOINTS } from '../constants/api-endpoints';

interface TaskList {
  id: string;
  title: string;
}

export const TaskListDebugComponent = () => {
  const { status } = useSession();
  const [taskLists, setTaskLists] = useState<TaskList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && isExpanded) {
      fetchTaskLists();
    }
  }, [status, isExpanded]);

  const fetchTaskLists = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.TASKS_LISTS);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch task lists');
      }

      setTaskLists(data.taskLists);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch task lists');
      setLoading(false);
      console.error('Task lists fetch error:', err);
    }
  };

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded && taskLists.length === 0) {
      setLoading(true);
    }
  };

  const copyToClipboard = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Card className="w-full">
      <Flex direction="column" gap="3" p="4">
        <Flex justify="between" align="center">
          <Text size="3" weight="medium" color="gray">Task Lists Info</Text>
          <Button onClick={handleToggle} size="1" variant="soft">
            {isExpanded ? 'Hide' : 'Show'} Task Lists
          </Button>
        </Flex>

        {isExpanded && (
          <>
            {loading ? (
              <Text size="2" color="gray">Loading...</Text>
            ) : error ? (
              <Text size="2" color="red">{error}</Text>
            ) : (
              <Table.Root size="1">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>
                      <Text size="1" weight="bold">Title</Text>
                    </Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>
                      <Text size="1" weight="bold">ID</Text>
                    </Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell />
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {taskLists.map((list) => (
                    <Table.Row key={list.id}>
                      <Table.Cell>
                        <Text size="1" weight="medium">{list.title}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Code size="1">{list.id}</Code>
                      </Table.Cell>
                      <Table.Cell>
                        <IconButton
                          size="1"
                          variant="ghost"
                          onClick={() => copyToClipboard(list.id)}
                          aria-label="Copy task list ID"
                        >
                          <CopyIcon />
                        </IconButton>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            )}
          </>
        )}
      </Flex>
    </Card>
  );
};
