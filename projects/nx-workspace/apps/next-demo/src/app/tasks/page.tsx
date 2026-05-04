'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Flex,
  Text,
  Button,
  Spinner,
  Tabs,
  TextField,
  Callout,
  Select,
} from '@radix-ui/themes';
import { useAuth } from '../providers/auth-provider';
import { useGoogleToken } from '../hooks/use-google-token';

type Phase = 'input' | 'analyzing' | 'preview' | 'creating' | 'done';

type TaskResult = {
  title: string;
  success: boolean;
  taskId?: string | null;
  error?: string;
};

type TaskList = { id: string; title: string };

const ITEM_REGEX = /^\s*[-*]\s+(.+)/;

const parseMarkdownList = (text: string): string[] =>
  text
    .split('\n')
    .map(line => line.match(ITEM_REGEX)?.[1]?.trim())
    .filter((item): item is string => !!item);

export default function TasksPage() {
  const session = useAuth();
  const { googleToken, clearGoogleToken, requestGoogleAuth } = useGoogleToken();

  const [phase, setPhase] = useState<Phase>('input');
  const [items, setItems] = useState<string[]>([]);
  const [results, setResults] = useState<TaskResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [newItem, setNewItem] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [taskLists, setTaskLists] = useState<TaskList[]>([]);
  const [selectedListId, setSelectedListId] = useState('');
  const [listsLoaded, setListsLoaded] = useState(false);

  const accessToken = session?.access_token ?? '';

  useEffect(() => {
    if (!googleToken || !accessToken) return;
    fetch('/api/tasks/lists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ googleToken }),
    })
      .then(r => r.json())
      .then(data => {
        const lists: TaskList[] = data.lists || [];
        setTaskLists(lists);
        if (lists.length) {
          setSelectedListId(prev =>
            prev && lists.some(l => l.id === prev) ? prev : lists[0].id,
          );
        }
        setListsLoaded(true);
      })
      .catch(() => setListsLoaded(true));
  }, [googleToken, accessToken]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhase('analyzing');
    setError(null);

    const reader = new FileReader();
    reader.onload = async ev => {
      const dataUrl = ev.target?.result as string;
      const base64 = dataUrl.split(',')[1];

      const res = await fetch('/api/tasks/parse-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          images: [{ base64, mimeType: file.type }],
        }),
      });

      if (!res.ok) {
        setError('Failed to analyze image. Please try again.');
        setPhase('input');
        return;
      }

      const data = await res.json();
      if (!data.items?.length) {
        setError('No list items found in the image.');
        setPhase('input');
        return;
      }

      setItems(data.items);
      setPhase('preview');
    };
    reader.readAsDataURL(file);
  };

  const handleParseText = () => {
    const parsed = parseMarkdownList(textInput);
    if (!parsed.length) {
      setError('No list items found. Use markdown list format (- item).');
      return;
    }
    setError(null);
    setItems(parsed);
    setPhase('preview');
  };

  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleEditItem = (index: number, value: string) => {
    setItems(prev => prev.map((item, i) => (i === index ? value : item)));
  };

  const handleAddItem = () => {
    const trimmed = newItem.trim();
    if (!trimmed) return;
    setItems(prev => [...prev, trimmed]);
    setNewItem('');
  };

  const handleCreateTasks = async () => {
    if (!googleToken) {
      clearGoogleToken();
      setError('Google Tasks access required. Please sign in again.');
      return;
    }

    setPhase('creating');
    setError(null);

    const res = await fetch('/api/tasks/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        items,
        googleToken,
        taskListId: selectedListId,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      if (data.error === 'google_token_expired') {
        clearGoogleToken();
        setError('Google token expired. Please re-authenticate.');
        setPhase('preview');
        return;
      }
      setError('Failed to create tasks.');
      setPhase('preview');
      return;
    }

    const data = await res.json();
    setResults(data.results);
    setPhase('done');
  };

  const handleReset = () => {
    setPhase('input');
    setItems([]);
    setResults([]);
    setError(null);
    setTextInput('');
    setNewItem('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  const selectedListName =
    taskLists.find(l => l.id === selectedListId)?.title ?? selectedListId;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Flex justify="between" align="center">
        <Text size="6" weight="bold">
          Task Upload
        </Text>
        {googleToken && listsLoaded && taskLists.length > 0 && (
          <Select.Root value={selectedListId} onValueChange={setSelectedListId}>
            <Select.Trigger placeholder="Select task list" />
            <Select.Content>
              {taskLists.map(l => (
                <Select.Item key={l.id} value={l.id ?? ''}>
                  {l.title}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        )}
      </Flex>

      {!googleToken && (
        <Callout.Root color="orange">
          <Callout.Text>
            Google Tasks access required.{' '}
            <button
              onClick={requestGoogleAuth}
              className="underline font-medium cursor-pointer bg-transparent border-none text-inherit"
            >
              Sign in with Google
            </button>{' '}
            to grant permission.
          </Callout.Text>
        </Callout.Root>
      )}

      {error && (
        <Callout.Root color="red">
          <Callout.Text>{error}</Callout.Text>
        </Callout.Root>
      )}

      {phase === 'input' && (
        <Tabs.Root defaultValue="text">
          <Tabs.List>
            <Tabs.Trigger value="text">Text List</Tabs.Trigger>
            <Tabs.Trigger value="image">Image Upload</Tabs.Trigger>
          </Tabs.List>

          <Box pt="4">
            <Tabs.Content value="text">
              <Flex direction="column" gap="3">
                <Text size="2" color="gray">
                  Paste a markdown list (lines starting with - or *)
                </Text>
                <textarea
                  value={textInput}
                  onChange={e => setTextInput(e.target.value)}
                  placeholder={
                    '- Buy groceries\n- Clean kitchen\n- Call dentist'
                  }
                  rows={10}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm font-mono resize-y"
                />
                <Button
                  onClick={handleParseText}
                  disabled={!textInput.trim()}
                  className="cursor-pointer"
                >
                  Parse List
                </Button>
              </Flex>
            </Tabs.Content>

            <Tabs.Content value="image">
              <Flex direction="column" gap="3">
                <Text size="2" color="gray">
                  Upload a photo of a handwritten or printed list
                </Text>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="text-sm"
                />
              </Flex>
            </Tabs.Content>
          </Box>
        </Tabs.Root>
      )}

      {phase === 'analyzing' && (
        <Flex align="center" gap="2">
          <Spinner />
          <Text size="2">Analyzing image...</Text>
        </Flex>
      )}

      {phase === 'preview' && (
        <Flex direction="column" gap="3">
          <Text size="3" weight="medium">
            {items.length} item{items.length !== 1 ? 's' : ''} found
            {' \u2192 '}
            {selectedListName}
          </Text>

          <Flex direction="column" gap="2">
            {items.map((item, i) => (
              <Flex key={i} gap="2" align="center">
                <TextField.Root
                  value={item}
                  onChange={e => handleEditItem(i, e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  color="red"
                  size="1"
                  onClick={() => handleRemoveItem(i)}
                  className="cursor-pointer"
                >
                  Remove
                </Button>
              </Flex>
            ))}
          </Flex>

          <Flex gap="2">
            <TextField.Root
              value={newItem}
              onChange={e => setNewItem(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddItem()}
              placeholder="Add another item..."
              className="flex-1"
            />
            <Button
              variant="soft"
              onClick={handleAddItem}
              disabled={!newItem.trim()}
              className="cursor-pointer"
            >
              Add
            </Button>
          </Flex>

          <Flex gap="2">
            <Button
              onClick={handleCreateTasks}
              disabled={!items.length || !googleToken || !selectedListId}
              className="cursor-pointer"
            >
              Create {items.length} Task{items.length !== 1 ? 's' : ''}
            </Button>
            <Button
              variant="soft"
              onClick={handleReset}
              className="cursor-pointer"
            >
              Start Over
            </Button>
          </Flex>
        </Flex>
      )}

      {phase === 'creating' && (
        <Flex align="center" gap="2">
          <Spinner />
          <Text size="2">Creating {items.length} tasks...</Text>
        </Flex>
      )}

      {phase === 'done' && (
        <Flex direction="column" gap="3">
          <Callout.Root color="green">
            <Callout.Text>
              Created {successCount} task{successCount !== 1 ? 's' : ''}
              {failCount > 0 && ` (${failCount} failed)`}
            </Callout.Text>
          </Callout.Root>

          <Flex direction="column" gap="1">
            {results.map((r, i) => (
              <Flex key={i} gap="2" align="center">
                <Text size="2" color={r.success ? 'green' : 'red'}>
                  {r.success ? '✓' : '✗'}
                </Text>
                <Text size="2">{r.title}</Text>
                {r.error && (
                  <Text size="1" color="red">
                    ({r.error})
                  </Text>
                )}
              </Flex>
            ))}
          </Flex>

          <Button onClick={handleReset} className="cursor-pointer">
            Upload More
          </Button>
        </Flex>
      )}
    </div>
  );
}
