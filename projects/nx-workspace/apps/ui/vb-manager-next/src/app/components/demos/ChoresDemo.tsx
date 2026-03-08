'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Flex,
  Box,
  Text,
  Button,
  TextField,
  TextArea,
  Select,
  Checkbox,
  Table,
  Badge,
  Dialog,
} from '@radix-ui/themes';

interface Chore {
  id: string;
  name: string;
  description: string;
  recurrence: 'daily' | 'weekly' | 'monthly';
  multiplier: number;
  isUrgent: boolean;
  isImportant: boolean;
  completions: string[];
  createdAt: string;
}

interface Todo {
  choreId: string;
  choreName: string;
  isUrgent: boolean;
  isImportant: boolean;
  daysOverdue: number;
  instanceNumber: number;
  totalInstances: number;
  isCompleted: boolean;
}

function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  };

  return [storedValue, setValue];
}

function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.floor((date2.getTime() - date1.getTime()) / oneDay);
}

function isInCurrentPeriod(
  date: Date,
  recurrence: Chore['recurrence'],
  today: Date,
): boolean {
  const dateNormalized = new Date(date);
  dateNormalized.setHours(0, 0, 0, 0);

  switch (recurrence) {
    case 'daily':
      return dateNormalized.getTime() === today.getTime();
    case 'weekly': {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return dateNormalized >= weekStart && dateNormalized <= weekEnd;
    }
    case 'monthly':
      return (
        dateNormalized.getMonth() === today.getMonth() &&
        dateNormalized.getFullYear() === today.getFullYear()
      );
    default:
      return false;
  }
}

function generateTodos(chores: Chore[]): Todo[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todos: Todo[] = [];

  chores.forEach(chore => {
    const completionsInPeriod = chore.completions.filter(completionDateStr => {
      const completionDate = new Date(completionDateStr);
      return isInCurrentPeriod(completionDate, chore.recurrence, today);
    }).length;

    const remainingInstances = chore.multiplier - completionsInPeriod;

    const createdAt = new Date(chore.createdAt);
    createdAt.setHours(0, 0, 0, 0);

    let daysOverdue = 0;

    if (createdAt < today && remainingInstances > 0) {
      daysOverdue = daysBetween(createdAt, today);
    }

    if (remainingInstances > 0) {
      for (let i = 0; i < chore.multiplier; i++) {
        const isCompleted = i < completionsInPeriod;
        todos.push({
          choreId: chore.id,
          choreName: chore.name,
          isUrgent: chore.isUrgent,
          isImportant: chore.isImportant,
          daysOverdue,
          instanceNumber: i + 1,
          totalInstances: chore.multiplier,
          isCompleted,
        });
      }
    }
  });

  return todos;
}

const DAILY_CHORES: Omit<Chore, 'id' | 'createdAt'>[] = [
  {
    name: 'Walk dog',
    description: 'Take the dog for a walk around the block',
    recurrence: 'daily',
    multiplier: 3,
    isUrgent: true,
    isImportant: true,
    completions: [],
  },
  {
    name: 'Feed Niko',
    description: '',
    recurrence: 'daily',
    multiplier: 2,
    isUrgent: true,
    isImportant: true,
    completions: [],
  },
  {
    name: 'Daily kitchen cleanup',
    description: '',
    recurrence: 'daily',
    multiplier: 2,
    isUrgent: true,
    isImportant: false,
    completions: [],
  },
  {
    name: 'Social Media Catchup',
    description: '',
    recurrence: 'daily',
    multiplier: 1,
    isUrgent: false,
    isImportant: true,
    completions: [],
  },
];

const WEEKLY_CHORES: Omit<Chore, 'id' | 'createdAt'>[] = [
  {
    name: 'Run robot vacuum',
    description: '',
    recurrence: 'weekly',
    multiplier: 1,
    isUrgent: false,
    isImportant: false,
    completions: [],
  },
  {
    name: 'Takeout Trash',
    description: '',
    recurrence: 'weekly',
    multiplier: 1,
    isUrgent: false,
    isImportant: false,
    completions: [],
  },
  {
    name: 'Laundry',
    description: '',
    recurrence: 'weekly',
    multiplier: 1,
    isUrgent: false,
    isImportant: false,
    completions: [],
  },
  {
    name: 'Common Area Cleanup',
    description: '',
    recurrence: 'weekly',
    multiplier: 1,
    isUrgent: false,
    isImportant: false,
    completions: [],
  },
];

const MONTHLY_CHORES: Omit<Chore, 'id' | 'createdAt'>[] = [
  {
    name: 'Clean kitchen surfaces',
    description: '',
    recurrence: 'monthly',
    multiplier: 1,
    isUrgent: false,
    isImportant: false,
    completions: [],
  },
  {
    name: 'Clean bathroom',
    description: '',
    recurrence: 'monthly',
    multiplier: 1,
    isUrgent: false,
    isImportant: false,
    completions: [],
  },
];

const DEFAULT_CHORES: Omit<Chore, 'id' | 'createdAt'>[] = [
  ...DAILY_CHORES,
  ...WEEKLY_CHORES,
  ...MONTHLY_CHORES,
];

export function ChoresDemo() {
  const [mounted, setMounted] = useState(false);
  const [chores, setChores] = useLocalStorage<Chore[]>('chores', []);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingChore, setEditingChore] = useState<Chore | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    recurrence: 'weekly' as Chore['recurrence'],
    multiplier: 1,
    isUrgent: false,
    isImportant: false,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && chores.length === 0) {
      const defaultChores: Chore[] = DEFAULT_CHORES.map((chore, index) => ({
        ...chore,
        id: `default-${index}`,
        createdAt: new Date().toISOString(),
      }));
      setChores(defaultChores);
    }
  }, [mounted]);

  useEffect(() => {
    if (mounted) {
      setTodos(generateTodos(chores));
    }
  }, [chores, mounted]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      recurrence: 'weekly',
      multiplier: 1,
      isUrgent: false,
      isImportant: false,
    });
    setEditingChore(null);
    setIsFormOpen(false);
  };

  const handleCreateChore = () => {
    const newChore: Chore = {
      id: Date.now().toString(),
      ...formData,
      completions: [],
      createdAt: new Date().toISOString(),
    };
    setChores(prev => [...prev, newChore]);
    resetForm();
  };

  const handleUpdateChore = () => {
    if (!editingChore) return;
    setChores(prev =>
      prev.map(chore =>
        chore.id === editingChore.id ? { ...chore, ...formData } : chore,
      ),
    );
    resetForm();
  };

  const handleDeleteChore = (id: string) => {
    if (!confirm('Are you sure you want to delete this chore?')) return;
    setChores(prev => prev.filter(chore => chore.id !== id));
  };

  const handleEditChore = (chore: Chore) => {
    setEditingChore(chore);
    setFormData({
      name: chore.name,
      description: chore.description,
      recurrence: chore.recurrence,
      multiplier: chore.multiplier,
      isUrgent: chore.isUrgent,
      isImportant: chore.isImportant,
    });
    setIsFormOpen(true);
  };

  const handleCompleteTodo = (choreId: string) => {
    const completionDate = new Date().toISOString();
    setChores(prev =>
      prev.map(chore =>
        chore.id === choreId
          ? { ...chore, completions: [...chore.completions, completionDate] }
          : chore,
      ),
    );
  };

  const handleUncompleteTodo = (choreId: string) => {
    setChores(prev =>
      prev.map(chore => {
        if (chore.id !== choreId) return chore;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const completionsInPeriod = chore.completions.filter(dateStr =>
          isInCurrentPeriod(new Date(dateStr), chore.recurrence, today),
        );

        if (completionsInPeriod.length > 0) {
          const mostRecentCompletion =
            completionsInPeriod[completionsInPeriod.length - 1];
          const newCompletions = [...chore.completions];
          const indexToRemove =
            newCompletions.lastIndexOf(mostRecentCompletion);
          newCompletions.splice(indexToRemove, 1);
          return { ...chore, completions: newCompletions };
        }

        return chore;
      }),
    );
  };

  if (!mounted) {
    return (
      <Box p="6" style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <Flex direction="column" gap="4">
          <Text size="3" color="gray">
            Loading...
          </Text>
        </Flex>
      </Box>
    );
  }

  return (
    <Box p="6" style={{ maxWidth: '1280px', margin: '0 auto' }}>
      <Flex direction="column" gap="4">
        <Card>
          <Flex direction="column" gap="4">
            <Text size="5" weight="bold">
              Active Todos
            </Text>
            {todos.length === 0 ? (
              <Box py="8">
                <Text align="center" color="gray" size="3">
                  No todos due yet!
                </Text>
              </Box>
            ) : (
              <Flex direction="column" gap="2">
                {(() => {
                  const sortedTodos = [...todos].sort((a, b) => {
                    const getPriority = (todo: Todo) => {
                      if (todo.isImportant && todo.isUrgent) return 0;
                      if (todo.isImportant) return 1;
                      if (todo.isUrgent) return 2;
                      return 3;
                    };
                    return getPriority(a) - getPriority(b);
                  });

                  const grouped = sortedTodos.reduce((acc, todo) => {
                    if (!acc[todo.choreId]) {
                      acc[todo.choreId] = [];
                    }
                    acc[todo.choreId].push(todo);
                    return acc;
                  }, {} as Record<string, typeof todos>);

                  return Object.entries(grouped).map(
                    ([choreId, choreTodos]) => {
                      const firstTodo = choreTodos[0];
                      return (
                        <Card key={choreId} variant="surface">
                          <Flex justify="between" align="center" gap="4">
                            <Flex gap="2" align="center" flexGrow="1">
                              <Text size="3" weight="medium">
                                {firstTodo.choreName}
                              </Text>
                              {firstTodo.isUrgent && (
                                <Badge color="red" size="1">
                                  Urgent
                                </Badge>
                              )}
                              {firstTodo.isImportant && (
                                <Badge color="amber" size="1">
                                  Important
                                </Badge>
                              )}
                              <Text size="2" color="gray">
                                {firstTodo.daysOverdue === 0
                                  ? '• Due today'
                                  : `• ${firstTodo.daysOverdue}d overdue`}
                              </Text>
                            </Flex>

                            <Flex gap="3" align="center">
                              {choreTodos.map(todo => (
                                <Checkbox
                                  key={todo.instanceNumber}
                                  size="3"
                                  checked={todo.isCompleted}
                                  onCheckedChange={checked => {
                                    if (checked && !todo.isCompleted) {
                                      handleCompleteTodo(todo.choreId);
                                    } else if (!checked && todo.isCompleted) {
                                      handleUncompleteTodo(todo.choreId);
                                    }
                                  }}
                                />
                              ))}
                            </Flex>
                          </Flex>
                        </Card>
                      );
                    },
                  );
                })()}
              </Flex>
            )}
          </Flex>
        </Card>

        <Card>
          <Flex direction="column" gap="4">
            <Flex justify="between" align="center">
              <Text size="5" weight="bold">
                Chores
              </Text>
              <Dialog.Root open={isFormOpen} onOpenChange={setIsFormOpen}>
                <Dialog.Trigger>
                  <Button>Add Chore</Button>
                </Dialog.Trigger>
                <Dialog.Content style={{ maxWidth: 500 }}>
                  <Dialog.Title>
                    {editingChore ? 'Edit Chore' : 'New Chore'}
                  </Dialog.Title>
                  <Flex direction="column" gap="4" mt="4">
                    <Box>
                      <Text as="label" size="2" weight="medium" mb="1">
                        Name
                      </Text>
                      <TextField.Root
                        placeholder="e.g., Clean kitchen"
                        value={formData.name}
                        onChange={e =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    </Box>

                    <Box>
                      <Text as="label" size="2" weight="medium" mb="1">
                        Description
                      </Text>
                      <TextArea
                        placeholder="e.g., Wipe counters, sweep floor, do dishes"
                        value={formData.description}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        rows={3}
                      />
                    </Box>

                    <Flex gap="4">
                      <Box style={{ flex: 1 }}>
                        <Text as="label" size="2" weight="medium" mb="1">
                          Recurrence
                        </Text>
                        <Select.Root
                          value={formData.recurrence}
                          onValueChange={value =>
                            setFormData({
                              ...formData,
                              recurrence: value as Chore['recurrence'],
                            })
                          }
                        >
                          <Select.Trigger />
                          <Select.Content>
                            <Select.Item value="daily">Daily</Select.Item>
                            <Select.Item value="weekly">Weekly</Select.Item>
                            <Select.Item value="monthly">Monthly</Select.Item>
                          </Select.Content>
                        </Select.Root>
                      </Box>

                      <Box style={{ width: '120px' }}>
                        <Text as="label" size="2" weight="medium" mb="1">
                          Multiplier
                        </Text>
                        <TextField.Root
                          type="number"
                          min="1"
                          max="10"
                          value={formData.multiplier.toString()}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              multiplier: Math.max(
                                1,
                                parseInt(e.target.value) || 1,
                              ),
                            })
                          }
                        />
                      </Box>
                    </Flex>

                    <Flex gap="4">
                      <Text as="label" size="2">
                        <Flex gap="2" align="center">
                          <Checkbox
                            checked={formData.isUrgent}
                            onCheckedChange={checked =>
                              setFormData({
                                ...formData,
                                isUrgent: checked === true,
                              })
                            }
                          />
                          Urgent
                        </Flex>
                      </Text>
                      <Text as="label" size="2">
                        <Flex gap="2" align="center">
                          <Checkbox
                            checked={formData.isImportant}
                            onCheckedChange={checked =>
                              setFormData({
                                ...formData,
                                isImportant: checked === true,
                              })
                            }
                          />
                          Important
                        </Flex>
                      </Text>
                    </Flex>

                    <Flex gap="2" justify="end" mt="4">
                      <Dialog.Close>
                        <Button variant="soft" color="gray" onClick={resetForm}>
                          Cancel
                        </Button>
                      </Dialog.Close>
                      <Button
                        onClick={
                          editingChore ? handleUpdateChore : handleCreateChore
                        }
                        disabled={!formData.name.trim()}
                      >
                        {editingChore ? 'Update' : 'Create'}
                      </Button>
                    </Flex>
                  </Flex>
                </Dialog.Content>
              </Dialog.Root>
            </Flex>

            {chores.length === 0 ? (
              <Box py="8">
                <Text align="center" color="gray" size="3">
                  No chores created yet
                </Text>
              </Box>
            ) : (
              <Table.Root variant="surface">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Description</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Recurrence</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Multiplier</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Flags</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Progress</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {chores.map(chore => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const completionsInPeriod = chore.completions.filter(
                      dateStr =>
                        isInCurrentPeriod(
                          new Date(dateStr),
                          chore.recurrence,
                          today,
                        ),
                    ).length;

                    return (
                      <Table.Row key={chore.id}>
                        <Table.Cell>
                          <Text weight="medium">{chore.name}</Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Text color="gray" size="2">
                            {chore.description || '-'}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Text size="2">{chore.recurrence}</Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Text size="2">{chore.multiplier}x</Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Flex gap="1">
                            {chore.isUrgent && (
                              <Badge color="red" size="1">
                                U
                              </Badge>
                            )}
                            {chore.isImportant && (
                              <Badge color="amber" size="1">
                                I
                              </Badge>
                            )}
                            {!chore.isUrgent && !chore.isImportant && (
                              <Text color="gray">-</Text>
                            )}
                          </Flex>
                        </Table.Cell>
                        <Table.Cell>
                          <Text
                            size="2"
                            color={
                              completionsInPeriod >= chore.multiplier
                                ? 'green'
                                : 'gray'
                            }
                          >
                            {completionsInPeriod}/{chore.multiplier}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Flex gap="2">
                            <Button
                              size="1"
                              variant="soft"
                              onClick={() => handleEditChore(chore)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="1"
                              variant="soft"
                              color="red"
                              onClick={() => handleDeleteChore(chore.id)}
                            >
                              Delete
                            </Button>
                          </Flex>
                        </Table.Cell>
                      </Table.Row>
                    );
                  })}
                </Table.Body>
              </Table.Root>
            )}
          </Flex>
        </Card>
      </Flex>
    </Box>
  );
}
