'use client';

import { useState, useEffect } from 'react';
import { Card, Text, Table, Badge, Dialog } from '@radix-ui/themes';
import {
  Button,
  Checkbox,
  Input,
  Select,
  Textarea,
} from '@vigilant-broccoli/react-lib';

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

type Recurrence = Chore['recurrence'];
const RECURRENCE_OPTIONS: Recurrence[] = ['daily', 'weekly', 'monthly'];
const RECURRENCE_LABELS: Record<Recurrence, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

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
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
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
    } catch {
      // ignore
    }
  };

  return [storedValue, setValue];
}

function daysBetween(date1: Date, date2: Date): number {
  return Math.floor(
    (date2.getTime() - date1.getTime()) / (24 * 60 * 60 * 1000),
  );
}

function isInCurrentPeriod(
  date: Date,
  recurrence: Chore['recurrence'],
  today: Date,
): boolean {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  switch (recurrence) {
    case 'daily':
      return d.getTime() === today.getTime();
    case 'weekly': {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return d >= weekStart && d <= weekEnd;
    }
    case 'monthly':
      return (
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear()
      );
  }
}

function generateTodos(chores: Chore[]): Todo[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todos: Todo[] = [];

  chores.forEach(chore => {
    const completionsInPeriod = chore.completions.filter(s =>
      isInCurrentPeriod(new Date(s), chore.recurrence, today),
    ).length;
    const remainingInstances = chore.multiplier - completionsInPeriod;
    if (remainingInstances <= 0) return;

    const createdAt = new Date(chore.createdAt);
    createdAt.setHours(0, 0, 0, 0);
    const daysOverdue = createdAt < today ? daysBetween(createdAt, today) : 0;

    for (let i = 0; i < chore.multiplier; i++) {
      todos.push({
        choreId: chore.id,
        choreName: chore.name,
        isUrgent: chore.isUrgent,
        isImportant: chore.isImportant,
        daysOverdue,
        instanceNumber: i + 1,
        totalInstances: chore.multiplier,
        isCompleted: i < completionsInPeriod,
      });
    }
  });

  return todos;
}

const DEFAULT_CHORES: Omit<Chore, 'id' | 'createdAt'>[] = [
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

const EMPTY_FORM = {
  name: '',
  description: '',
  recurrence: 'weekly' as Chore['recurrence'],
  multiplier: 1,
  isUrgent: false,
  isImportant: false,
};

export default function ChoresPage() {
  const [mounted, setMounted] = useState(false);
  const [chores, setChores] = useLocalStorage<Chore[]>('chores', []);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingChore, setEditingChore] = useState<Chore | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && chores.length === 0) {
      setChores(
        DEFAULT_CHORES.map((chore, i) => ({
          ...chore,
          id: `default-${i}`,
          createdAt: new Date().toISOString(),
        })),
      );
    }
  }, [mounted]);

  useEffect(() => {
    if (mounted) setTodos(generateTodos(chores));
  }, [chores, mounted]);

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setEditingChore(null);
    setIsFormOpen(false);
  };

  const handleSaveChore = () => {
    if (editingChore) {
      setChores(prev =>
        prev.map(c => (c.id === editingChore.id ? { ...c, ...formData } : c)),
      );
    } else {
      setChores(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          ...formData,
          completions: [],
          createdAt: new Date().toISOString(),
        },
      ]);
    }
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this chore?')) return;
    setChores(prev => prev.filter(c => c.id !== id));
  };

  const handleEdit = (chore: Chore) => {
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

  const handleComplete = (choreId: string) => {
    setChores(prev =>
      prev.map(c =>
        c.id === choreId
          ? { ...c, completions: [...c.completions, new Date().toISOString()] }
          : c,
      ),
    );
  };

  const handleUncomplete = (choreId: string) => {
    setChores(prev =>
      prev.map(c => {
        if (c.id !== choreId) return c;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const inPeriod = c.completions.filter(s =>
          isInCurrentPeriod(new Date(s), c.recurrence, today),
        );
        if (!inPeriod.length) return c;
        const last = inPeriod[inPeriod.length - 1];
        const next = [...c.completions];
        next.splice(next.lastIndexOf(last), 1);
        return { ...c, completions: next };
      }),
    );
  };

  if (!mounted) return null;

  const sortedTodos = [...todos].sort((a, b) => {
    const p = (t: Todo) =>
      t.isImportant && t.isUrgent ? 0 : t.isImportant ? 1 : t.isUrgent ? 2 : 3;
    return p(a) - p(b);
  });

  const grouped = sortedTodos.reduce(
    (acc, todo) => {
      if (!acc[todo.choreId]) acc[todo.choreId] = [];
      acc[todo.choreId].push(todo);
      return acc;
    },
    {} as Record<string, Todo[]>,
  );

  return (
    <div className="max-w-5xl mx-auto p-2 sm:p-6 space-y-6">
      <div className="flex flex-col gap-4">
        <Card>
          <div className="flex flex-col gap-4">
            <Text size="5" weight="bold">
              Active Todos
            </Text>
            {Object.keys(grouped).length === 0 ? (
              <div className="py-8">
                <Text align="center" color="gray" size="3">
                  No todos due yet!
                </Text>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {Object.entries(grouped).map(([choreId, choreTodos]) => {
                  const first = choreTodos[0];
                  return (
                    <Card key={choreId} variant="surface">
                      <div className="flex justify-between items-center gap-4">
                        <div className="flex gap-2 items-center grow">
                          <Text size="3" weight="medium">
                            {first.choreName}
                          </Text>
                          {first.isUrgent && (
                            <Badge color="red" size="1">
                              Urgent
                            </Badge>
                          )}
                          {first.isImportant && (
                            <Badge color="amber" size="1">
                              Important
                            </Badge>
                          )}
                          <Text size="2" color="gray">
                            {first.daysOverdue === 0
                              ? '• Due today'
                              : `• ${first.daysOverdue}d overdue`}
                          </Text>
                        </div>
                        <div className="flex gap-3 items-center">
                          {choreTodos.map(todo => (
                            <Checkbox
                              key={todo.instanceNumber}
                              className="h-5 w-5"
                              checked={todo.isCompleted}
                              onCheckedChange={checked => {
                                if (checked && !todo.isCompleted)
                                  handleComplete(todo.choreId);
                                else if (!checked && todo.isCompleted)
                                  handleUncomplete(todo.choreId);
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
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
                  <div className="flex flex-col gap-4 mt-4">
                    <div>
                      <Text as="label" size="2" weight="medium" mb="1">
                        Name
                      </Text>
                      <Input
                        placeholder="e.g., Clean kitchen"
                        value={formData.name}
                        onChange={e =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Text as="label" size="2" weight="medium" mb="1">
                        Description
                      </Text>
                      <Textarea
                        placeholder="Optional details"
                        value={formData.description}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-4">
                      <div style={{ flex: 1 }}>
                        <Text as="label" size="2" weight="medium" mb="1">
                          Recurrence
                        </Text>
                        <Select
                          selectedOption={formData.recurrence}
                          setValue={recurrence =>
                            setFormData({ ...formData, recurrence })
                          }
                          options={RECURRENCE_OPTIONS}
                          displayMapper={RECURRENCE_LABELS}
                        />
                      </div>
                      <div style={{ width: '120px' }}>
                        <Text as="label" size="2" weight="medium" mb="1">
                          Multiplier
                        </Text>
                        <Input
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
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <Text as="label" size="2">
                        <div className="flex gap-2 items-center">
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
                        </div>
                      </Text>
                      <Text as="label" size="2">
                        <div className="flex gap-2 items-center">
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
                        </div>
                      </Text>
                    </div>
                    <div className="flex gap-2 justify-end mt-4">
                      <Dialog.Close>
                        <Button variant="secondary" onClick={resetForm}>
                          Cancel
                        </Button>
                      </Dialog.Close>
                      <Button
                        onClick={handleSaveChore}
                        disabled={!formData.name.trim()}
                      >
                        {editingChore ? 'Update' : 'Create'}
                      </Button>
                    </div>
                  </div>
                </Dialog.Content>
              </Dialog.Root>
            </div>

            {chores.length === 0 ? (
              <div className="py-8">
                <Text align="center" color="gray" size="3">
                  No chores created yet
                </Text>
              </div>
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
                    const completionsInPeriod = chore.completions.filter(s =>
                      isInCurrentPeriod(new Date(s), chore.recurrence, today),
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
                          <div className="flex gap-1">
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
                          </div>
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
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleEdit(chore)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(chore.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    );
                  })}
                </Table.Body>
              </Table.Root>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
