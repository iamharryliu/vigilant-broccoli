'use client';

import { Card, Flex, Text, Checkbox, Button, TextField } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { CardSkeleton } from './skeleton.component';

interface Task {
  id: string;
  title: string;
  notes?: string;
  due?: string;
  status: 'needsAction' | 'completed';
}

// Helper to handle API errors consistently
const handleApiError = (err: unknown, fallbackMsg: string): string => {
  const message = err instanceof Error ? err.message : fallbackMsg;
  console.error(fallbackMsg, err);
  return message;
};

// Custom hook to manage task operations
const useTasks = (taskListId: string) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/tasks?taskListId=${taskListId}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch tasks');
      setTasks(data.tasks);
    } catch (err) {
      setError(handleApiError(err, 'Failed to fetch tasks'));
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (title: string) => {
    if (!title.trim()) return;
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskListId, title }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create task');
      await fetchTasks();
    } catch (err) {
      setError(handleApiError(err, 'Failed to create task'));
    }
  };

  const toggleTaskComplete = async (task: Task) => {
    try {
      const newStatus = task.status === 'completed' ? 'needsAction' : 'completed';
      const response = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskListId, taskId: task.id, status: newStatus }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update task');
      await fetchTasks();
    } catch (err) {
      setError(handleApiError(err, 'Failed to update task'));
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks?taskListId=${taskListId}&taskId=${taskId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete task');
      await fetchTasks();
    } catch (err) {
      setError(handleApiError(err, 'Failed to delete task'));
    }
  };

  return { tasks, loading, error, fetchTasks, createTask, toggleTaskComplete, deleteTask };
};

// Custom hook to manage task list metadata
const useTaskListName = (taskListId: string, status: string) => {
  const [taskListName, setTaskListName] = useState<string | null>(null);

  useEffect(() => {
    if (status !== 'authenticated') {
      setTaskListName(null);
      return;
    }

    const fetchTaskListName = async () => {
      try {
        const response = await fetch('/api/tasks/lists');
        const data = await response.json();
        if (response.ok && data.taskLists) {
          const list = data.taskLists.find((l: { id: string; title: string }) => l.id === taskListId);
          if (list) {
            setTaskListName(list.title);
          } else {
            console.warn(`Task list with ID ${taskListId} not found, using fallback`);
            setTaskListName('Tasks');
          }
        } else {
          setTaskListName('Tasks');
        }
      } catch (err) {
        console.error('Error fetching task list name:', err);
        setTaskListName('Tasks');
      }
    };
    fetchTaskListName();
  }, [taskListId, status]);

  return taskListName;
};

export const GoogleTasksComponent = ({ taskListId: propTaskListId }: { taskListId?: string } = {}) => {
  const { data: session, status } = useSession();
  const taskListId = propTaskListId || process.env.NEXT_PUBLIC_GOOGLE_TASK_LIST_ID || '@default';
  const taskListName = useTaskListName(taskListId, status);
  const { tasks, loading, error, fetchTasks, createTask, toggleTaskComplete, deleteTask } = useTasks(taskListId);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, taskListId]);

  const handleCreateTask = async () => {
    await createTask(newTaskTitle);
    setNewTaskTitle('');
    setShowAddTask(false);
  };

  const handleCancelAddTask = () => {
    setShowAddTask(false);
    setNewTaskTitle('');
  };

  if (status === 'loading') return <CardSkeleton showTitleSkeleton rows={5} />;

  if (status === 'unauthenticated') {
    return (
      <Card className="w-full">
        <Flex direction="column" gap="3" p="4">
          <Flex justify="between" align="center">
            <Text size="5" weight="bold">Tasks</Text>
            <Button onClick={() => signIn('google')} size="2">Sign in with Google</Button>
          </Flex>
          <Text size="2" color="gray">Sign in to view your Google Tasks</Text>
        </Flex>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <Flex direction="column" gap="3" p="4">
        {/* Header */}
        <Flex justify="between" align="center">
          {taskListName ? (
            <Text size="5" weight="bold">{taskListName}</Text>
          ) : (
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-32 rounded" />
          )}
          <Flex gap="2" align="center">
            {session?.user?.email && <Text size="1" color="gray">{session.user.email}</Text>}
            <Button onClick={() => signOut()} size="1" variant="soft">Sign out</Button>
          </Flex>
        </Flex>

        {/* Add Task Form */}
        {showAddTask ? (
          <Flex gap="2" align="end">
            <TextField.Root
              placeholder="Add a new task..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateTask();
                else if (e.key === 'Escape') handleCancelAddTask();
              }}
              className="flex-1"
            />
            <Button onClick={handleCreateTask} size="2">Add</Button>
            <Button onClick={handleCancelAddTask} size="2" variant="soft">Cancel</Button>
          </Flex>
        ) : (
          <Button onClick={() => setShowAddTask(true)} size="2" variant="soft">+ Add Task</Button>
        )}

        {/* Tasks List */}
        {loading ? (
          <Flex direction="column" gap="2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-10 rounded" />
            ))}
          </Flex>
        ) : error ? (
          <Text size="2" color="red">{error}</Text>
        ) : tasks.length === 0 ? (
          <Text size="2" color="gray">No tasks to display</Text>
        ) : (
          <Flex direction="column" gap="2">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-start gap-3 py-2 hover:bg-gray-50 rounded px-2 -mx-2 group">
                <Checkbox
                  checked={task.status === 'completed'}
                  onCheckedChange={() => toggleTaskComplete(task)}
                  className="mt-0.5"
                />
                <Flex direction="column" gap="1" className="flex-1">
                  <Text size="2" className={task.status === 'completed' ? 'line-through text-gray-400' : ''}>
                    {task.title}
                  </Text>
                  {task.notes && <Text size="1" color="gray">{task.notes}</Text>}
                  {task.due && <Text size="1" color="blue">Due: {new Date(task.due).toLocaleDateString()}</Text>}
                </Flex>
                <Button
                  onClick={() => deleteTask(task.id)}
                  size="1"
                  variant="ghost"
                  color="red"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Delete
                </Button>
              </div>
            ))}
          </Flex>
        )}
      </Flex>
    </Card>
  );
};
