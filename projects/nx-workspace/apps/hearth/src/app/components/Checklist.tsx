'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  KeyboardEvent,
} from 'react';
import {
  Button,
  DropdownMenu,
  CheckListBase,
  CheckListBaseItem,
  DeleteItemConfirmationDialog,
  FULL_SCREEN_ON_MOBILE_DIALOG_CLASS,
  IconButton,
  Input,
  Text,
  Dialog,
  DialogContent,
  DialogTitle,
  cn,
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

const toBaseItem = (item: ChecklistItem): CheckListBaseItem => ({
  id: item.id,
  title: item.name,
  checked: item.completed,
  completedAt: item.completedAt,
});

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

  const baseItems = useMemo(() => items.map(toBaseItem), [items]);

  if (!homeId) return null;

  const startEditById = (item: CheckListBaseItem) => {
    const source = items.find(candidate => candidate.id === item.id);
    if (source) startEdit(source);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const renderItemAccessory = (item: CheckListBaseItem) => (
    <div onClick={e => e.stopPropagation()}>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <IconButton icon="ellipsis-vertical" variant="ghost" />
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item
            onSelect={() =>
              setCalendarItem(items.find(i => i.id === item.id) ?? null)
            }
          >
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

      <CheckListBase
        items={baseItems}
        editingItemId={editingId}
        editingItemTitle={editingName}
        onToggleCheck={item => handleToggle(item.id, !item.checked)}
        onStartEdit={startEditById}
        onEditChange={setEditingName}
        onSaveEdit={saveEdit}
        onCancelEdit={cancelEdit}
        editor="input"
        rowVariant="dense"
        size="3"
        editCompleted={false}
        storageKeyPrefix={storageKeyPrefix}
        completedSectionId={`${storageKeyPrefix}-completed`}
        emptyLabel={
          <div className="py-4">
            <Text align="center" color="gray" size="3">
              {emptyText}
            </Text>
          </div>
        }
        renderItemAccessory={renderItemAccessory}
      />

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

      <Dialog
        open={calendarItem !== null}
        onOpenChange={open => {
          if (!open) setCalendarItem(null);
        }}
      >
        <DialogContent
          aria-describedby={undefined}
          showCloseButton={false}
          className={cn(
            'block w-[calc(100%-2rem)] max-w-[600px] max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto',
            FULL_SCREEN_ON_MOBILE_DIALOG_CLASS,
          )}
          style={{ maxWidth: 460 }}
        >
          <DialogTitle className="mb-3 text-xl font-bold leading-7 tracking-normal">
            {EVENT_DIALOG_TITLE}
          </DialogTitle>
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
        </DialogContent>
      </Dialog>
    </div>
  );
}
