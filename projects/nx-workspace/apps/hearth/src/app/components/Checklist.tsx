'use client';

import { useCallback, useEffect, useState, KeyboardEvent } from 'react';
import { Dialog, DropdownMenu } from '@radix-ui/themes';
import {
  Button,
  Checkbox,
  CollapsibleList,
  DeleteItemConfirmationDialog,
  FULL_SCREEN_ON_MOBILE_DIALOG_CLASS,
  IconButton,
  Input,
  Text,
} from '@vigilant-broccoli/react-lib';
import { useAuth } from '../providers/auth-provider';
import { useHome } from '../providers/home-provider';
import { ChecklistItem } from '../../lib/types';
import {
  CalendarEventForm,
  CalendarEventFormData,
} from '../calendar/components/CalendarEventForm';

const DELETE_LABEL = 'Delete';
const ADD_TO_CALENDAR_LABEL = 'Add to calendar';
const EVENT_DIALOG_TITLE = 'Add to calendar';
const CALENDAR_EVENTS_ENDPOINT = '/api/calendar/events';
const EVENT_DEFAULT_DURATION_MS = 60 * 60 * 1000;

type ChecklistProps = {
  endpoint: string;
  storageKeyPrefix: string;
  addPlaceholder: string;
  emptyText: string;
  refreshSignal?: number;
  onCalendarEventAdded?: () => void;
};

export function Checklist({
  endpoint,
  storageKeyPrefix,
  addPlaceholder,
  emptyText,
  refreshSignal,
  onCalendarEventAdded,
}: ChecklistProps) {
  const session = useAuth();
  const { selectedHomeId: homeId } = useHome();
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [newItem, setNewItem] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [calendarItem, setCalendarItem] = useState<ChecklistItem | null>(null);

  const token = session?.access_token ?? '';
  const authHeader = () => ({ Authorization: `Bearer ${token}` });
  const jsonHeaders = () => ({
    ...authHeader(),
    'Content-Type': 'application/json',
  });

  const fetchItems = useCallback(async () => {
    if (!homeId || !token) return;
    const res = await fetch(`${endpoint}?homeId=${homeId}`, {
      headers: authHeader(),
    });
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
  }, [endpoint, homeId, token]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems, refreshSignal]);

  const handleAdd = async () => {
    const name = newItem.trim();
    if (!name || !homeId) return;
    setNewItem('');
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify({ name, homeId }),
    });
    const created = await res.json();
    if (created?.id) setItems(prev => [created, ...prev]);
  };

  const handleToggle = async (id: string, completed: boolean) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              completed,
              completedAt: completed ? new Date().toISOString() : null,
            }
          : item,
      ),
    );
    await fetch(endpoint, {
      method: 'PATCH',
      headers: jsonHeaders(),
      body: JSON.stringify({ id, completed }),
    });
  };

  const handleDelete = async (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    await fetch(endpoint, {
      method: 'DELETE',
      headers: jsonHeaders(),
      body: JSON.stringify({ id }),
    });
  };

  const handleCreateEvent = async (data: CalendarEventFormData) => {
    setCalendarItem(null);
    if (!homeId) return;
    await fetch(CALENDAR_EVENTS_ENDPOINT, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify({ ...data, homeId, kitchenEvent: true }),
    });
    onCalendarEventAdded?.();
  };

  const startEdit = (item: ChecklistItem) => {
    setEditingId(item.id);
    setEditingName(item.name);
  };

  const saveEdit = async () => {
    const id = editingId;
    const name = editingName.trim();
    setEditingId(null);
    setEditingName('');
    if (!id || !name) return;
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, name } : item)),
    );
    await fetch(endpoint, {
      method: 'PATCH',
      headers: jsonHeaders(),
      body: JSON.stringify({ id, name }),
    });
  };

  const onNewKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleAdd();
  };

  const onEditKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') {
      setEditingId(null);
      setEditingName('');
    }
  };

  if (!homeId) return null;

  const active = items.filter(item => !item.completed);
  const completed = items
    .filter(item => item.completed)
    .sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''));

  const renderRow = (item: ChecklistItem) => (
    <div
      key={item.id}
      className="flex items-center gap-3 py-1.5 border-b border-[var(--gray-a4)] last:border-b-0"
    >
      <Checkbox
        className="h-5 w-5 shrink-0"
        checked={item.completed}
        onCheckedChange={checked => handleToggle(item.id, checked === true)}
      />
      {editingId === item.id ? (
        <Input
          autoFocus
          className="grow"
          value={editingName}
          onChange={e => setEditingName(e.target.value)}
          onBlur={saveEdit}
          onKeyDown={onEditKeyDown}
        />
      ) : (
        <Text
          size="3"
          className={`grow cursor-text ${
            item.completed ? 'line-through text-[var(--gray-a9)]' : ''
          }`}
          onClick={() => !item.completed && startEdit(item)}
        >
          {item.name}
        </Text>
      )}
      <div onClick={e => e.stopPropagation()}>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <IconButton icon="ellipsis-vertical" variant="ghost" />
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item onSelect={() => setCalendarItem(item)}>
              {ADD_TO_CALENDAR_LABEL}
            </DropdownMenu.Item>
            <DropdownMenu.Item
              color="red"
              onSelect={() => setPendingDeleteId(item.id)}
            >
              {DELETE_LABEL}
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <Input
          className="grow"
          placeholder={addPlaceholder}
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          onKeyDown={onNewKeyDown}
        />
        <Button onClick={handleAdd} disabled={!newItem.trim()}>
          Add
        </Button>
      </div>

      {active.length === 0 ? (
        <div className="py-4">
          <Text align="center" color="gray" size="3">
            {emptyText}
          </Text>
        </div>
      ) : (
        <div className="flex flex-col">{active.map(renderRow)}</div>
      )}

      {completed.length > 0 && (
        <CollapsibleList
          storageKeyPrefix={storageKeyPrefix}
          items={[
            {
              id: `${storageKeyPrefix}-completed`,
              title: `Completed (${completed.length})`,
              content: (
                <div className="flex flex-col">{completed.map(renderRow)}</div>
              ),
            },
          ]}
        />
      )}

      <DeleteItemConfirmationDialog
        open={pendingDeleteId !== null}
        onOpenChange={open => {
          if (!open) setPendingDeleteId(null);
        }}
        confirmLabel={DELETE_LABEL}
        deleteItem={async () => {
          if (pendingDeleteId) await handleDelete(pendingDeleteId);
          setPendingDeleteId(null);
        }}
      />

      <Dialog.Root
        open={calendarItem !== null}
        onOpenChange={open => {
          if (!open) setCalendarItem(null);
        }}
      >
        <Dialog.Content
          className={FULL_SCREEN_ON_MOBILE_DIALOG_CLASS}
          style={{ maxWidth: 460 }}
        >
          <Dialog.Title>{EVENT_DIALOG_TITLE}</Dialog.Title>
          {calendarItem && (
            <CalendarEventForm
              initialData={{
                title: calendarItem.name,
                description: '',
                start: new Date().toISOString(),
                end: new Date(
                  Date.now() + EVENT_DEFAULT_DURATION_MS,
                ).toISOString(),
                allDay: false,
                color: '',
              }}
              onSubmit={handleCreateEvent}
              onCancel={() => setCalendarItem(null)}
            />
          )}
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
}
