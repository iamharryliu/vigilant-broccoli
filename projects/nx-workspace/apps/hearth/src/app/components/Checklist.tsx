'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  KeyboardEvent,
} from 'react';
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import {
  Button,
  DropdownMenu,
  CheckList,
  CheckListItem as BaseChecklistItem,
  FULL_SCREEN_ON_MOBILE_DIALOG_CLASS,
  IconButton,
  Input,
  Text,
  Dialog,
  DialogContent,
  DialogTitle,
  cn,
  useRefetchOnFocus,
} from '@vigilant-broccoli/react-lib';
import { DeleteItemConfirmationDialog } from '@vigilant-broccoli/react-lib-higher-level';
import { HTTP_METHOD } from '@vigilant-broccoli/common-js';
import { useAuth } from '../providers/auth-provider';
import { useHome } from '../providers/home-provider';
import { ChecklistItem } from '../../lib/types';
import {
  CalendarEventForm,
  CalendarEventFormData,
} from '../calendar/components/CalendarEventForm';
import { useAuthHeader, useJsonAuthHeaders } from '../hooks/use-auth-headers';
import { assertOk, usePendingWrites } from '../hooks/use-pending-writes';
import { ChecklistSkeleton } from './ChecklistSkeleton';

const DELETE_LABEL = 'Delete';
const LOADING_LABEL = 'Loading items';
const ADD_TO_CALENDAR_LABEL = 'Add to calendar';
const EVENT_DIALOG_TITLE = 'Add to calendar';
const CALENDAR_EVENTS_ENDPOINT = '/api/calendar/events';
const EVENT_DEFAULT_DURATION_MS = 60 * 60 * 1000;

const toBaseItem = (
  item: ChecklistItem,
  pendingIds: ReadonlySet<string>,
): BaseChecklistItem => ({
  id: item.id,
  title: item.name,
  checked: item.completed,
  completedAt: item.completedAt,
  isRemoving: pendingIds.has(item.id),
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
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [calendarItem, setCalendarItem] = useState<ChecklistItem | null>(null);

  const token = session?.access_token ?? '';
  const authHeader = useAuthHeader();
  const jsonHeaders = useJsonAuthHeaders();
  const { pendingIds, isPending, write } = usePendingWrites();
  const loadedFetch = useRef<(() => Promise<void>) | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 8 },
    }),
  );

  const fetchItems = useCallback(async () => {
    if (!homeId || !token) return;
    const res = await fetch(`${endpoint}?homeId=${homeId}`, {
      headers: await authHeader(),
    });
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
  }, [endpoint, homeId, token, authHeader]);

  useRefetchOnFocus(fetchItems, {
    busy: pendingIds.size > 0 || !!editingId,
  });

  // CheckList slides in rows added after it mounts, so it mounts behind the
  // skeleton once the first fetch for a home resolves; a refreshSignal refetch
  // keeps it mounted.
  useEffect(() => {
    if (loadedFetch.current !== fetchItems) {
      loadedFetch.current = fetchItems;
      setItems([]);
      setLoading(true);
    }
    fetchItems().finally(() => setLoading(false));
  }, [fetchItems, refreshSignal]);

  const handleAdd = async () => {
    const name = newItem.trim();
    if (!name || !homeId) return;
    setNewItem('');
    const res = await fetch(endpoint, {
      method: HTTP_METHOD.POST,
      headers: await jsonHeaders(),
      body: JSON.stringify({ name, homeId }),
    });
    const created = await res.json();
    if (created?.id) setItems(prev => [created, ...prev]);
  };

  const setCompleted = (
    id: string,
    changes: Pick<ChecklistItem, 'completed' | 'completedAt'>,
  ) =>
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, ...changes } : item)),
    );

  const handleToggle = (id: string) => {
    const original = items.find(item => item.id === id);
    if (!original || isPending(id)) return;
    const completed = !original.completed;
    setCompleted(id, {
      completed,
      completedAt: completed ? new Date().toISOString() : null,
    });
    write(
      id,
      async () =>
        assertOk(
          await fetch(endpoint, {
            method: HTTP_METHOD.PATCH,
            headers: await jsonHeaders(),
            body: JSON.stringify({ id, completed }),
          }),
        ),
      () =>
        setCompleted(id, {
          completed: original.completed,
          completedAt: original.completedAt,
        }),
    );
  };

  const handleDelete = async (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    await fetch(endpoint, {
      method: HTTP_METHOD.DELETE,
      headers: await jsonHeaders(),
      body: JSON.stringify({ id }),
    });
  };

  const persistOrder = async (orderedItems: ChecklistItem[]) => {
    await fetch(endpoint, {
      method: HTTP_METHOD.PATCH,
      headers: await jsonHeaders(),
      body: JSON.stringify({
        order: orderedItems.map((item, position) => ({
          id: item.id,
          position,
        })),
      }),
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const activeItems = items.filter(item => !item.completed);
    const oldIndex = activeItems.findIndex(item => item.id === active.id);
    const newIndex = activeItems.findIndex(item => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const reorderedItems = [
      ...arrayMove(activeItems, oldIndex, newIndex),
      ...items.filter(item => item.completed),
    ].map((item, position) => ({ ...item, position }));
    setItems(reorderedItems);
    persistOrder(reorderedItems);
  };

  const handleCreateEvent = async (data: CalendarEventFormData) => {
    setCalendarItem(null);
    if (!homeId) return;
    await fetch(CALENDAR_EVENTS_ENDPOINT, {
      method: HTTP_METHOD.POST,
      headers: await jsonHeaders(),
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
      method: HTTP_METHOD.PATCH,
      headers: await jsonHeaders(),
      body: JSON.stringify({ id, name }),
    });
  };

  const onNewKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleAdd();
  };

  const baseItems = useMemo(
    () => items.map(item => toBaseItem(item, pendingIds)),
    [items, pendingIds],
  );

  if (!homeId) return null;

  const startEditById = (item: BaseChecklistItem) => {
    const source = items.find(candidate => candidate.id === item.id);
    if (source) startEdit(source);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const renderItemAccessory = (item: BaseChecklistItem) => (
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

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        {loading ? (
          <ChecklistSkeleton label={LOADING_LABEL} />
        ) : (
          <CheckList
            items={baseItems}
            editingItemId={editingId}
            editingItemTitle={editingName}
            onToggleCheck={item => handleToggle(item.id)}
            onStartEdit={startEditById}
            onEditChange={setEditingName}
            onSaveEdit={saveEdit}
            onCancelEdit={cancelEdit}
            editor="input"
            rowVariant="dense"
            size="3"
            editCompleted={false}
            enableDragDrop
            listId={storageKeyPrefix}
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
        )}
      </DndContext>

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
