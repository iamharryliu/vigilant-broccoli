import { useCallback, useState } from 'react';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import {
  Button,
  CheckList,
  CheckListItem,
  Heading,
  Input,
  Switch,
  Text,
} from '@vigilant-broccoli/react-lib';

const URGENT_PREFIX = 'URGENT:';

const URGENT_CLASS = 'bg-red-100 dark:bg-red-900/20 border-l-4 border-red-500';

const LIST_ID = 'checklist-demo';

const CONTROL_LABEL = {
  DRAG_DROP: 'Drag & drop',
  RESET: 'Reset demo',
} as const;

const ADD_PLACEHOLDER = 'Add an item, e.g. URGENT: renew the passport';
const ADD_LABEL = 'Add';
const EMPTY_LABEL = 'Nothing on the list yet';

const daysAgo = (days: number) =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

const seedItems = (): CheckListItem[] => [
  {
    id: 'seed-1',
    title: `${URGENT_PREFIX} Renew the passport`,
    checked: false,
    notes: 'Expires next month',
    due: daysAgo(-3),
    updatedAt: daysAgo(0.2),
  },
  {
    id: 'seed-2',
    title: 'Water the plants',
    checked: false,
    updatedAt: daysAgo(1),
  },
  {
    id: 'seed-3',
    title: 'Finish reading the sandbox docs',
    checked: false,
    notes: 'Just the CheckList section',
    updatedAt: daysAgo(2),
  },
  {
    id: 'seed-4',
    title: 'Book the dentist appointment',
    checked: true,
    updatedAt: daysAgo(4),
  },
];

const isUrgent = (item: CheckListItem) => item.title.startsWith(URGENT_PREFIX);

const createId = () =>
  `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export const CheckListDemo = () => {
  const [items, setItems] = useState<CheckListItem[]>(seedItems);
  const [enableDragDrop, setEnableDragDrop] = useState(true);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemTitle, setEditingItemTitle] = useState('');
  const [newItemTitle, setNewItemTitle] = useState('');

  const handleReset = useCallback(() => {
    setItems(seedItems());
    setEditingItemId(null);
    setEditingItemTitle('');
    setNewItemTitle('');
  }, []);

  const handleAddItem = useCallback(() => {
    const title = newItemTitle.trim();
    if (!title) return;
    setItems(prev => [
      {
        id: createId(),
        title,
        checked: false,
        updatedAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    setNewItemTitle('');
  }, [newItemTitle]);

  const handleToggleCheck = useCallback((item: CheckListItem) => {
    setItems(prev =>
      prev.map(i =>
        i.id === item.id
          ? { ...i, checked: !i.checked, updatedAt: new Date().toISOString() }
          : i,
      ),
    );
  }, []);

  const handleStartEdit = useCallback((item: CheckListItem) => {
    setEditingItemId(item.id);
    setEditingItemTitle(item.title);
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (editingItemId && editingItemTitle.trim()) {
      setItems(prev =>
        prev.map(i =>
          i.id === editingItemId ? { ...i, title: editingItemTitle.trim() } : i,
        ),
      );
    }
    setEditingItemId(null);
    setEditingItemTitle('');
  }, [editingItemId, editingItemTitle]);

  const handleCancelEdit = useCallback(() => {
    setEditingItemId(null);
    setEditingItemTitle('');
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setItems(prev => {
      const activeItems = prev.filter(i => !i.checked);
      const oldIndex = activeItems.findIndex(i => i.id === active.id);
      const newIndex = activeItems.findIndex(i => i.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;

      const reordered = arrayMove(activeItems, oldIndex, newIndex);
      let cursor = 0;
      return prev.map(i => (i.checked ? i : reordered[cursor++]));
    });
  }, []);

  const renderItemAccessory = useCallback(
    (item: CheckListItem) =>
      isUrgent(item) ? (
        <span className="text-xs px-2 py-0.5 rounded bg-red-200 dark:bg-red-900/40 text-red-700 dark:text-red-300 self-start">
          Urgent
        </span>
      ) : null,
    [],
  );

  const itemClassName = useCallback(
    (item: CheckListItem) => (isUrgent(item) ? URGENT_CLASS : ''),
    [],
  );

  const renderItemMeta = useCallback(
    (item: CheckListItem) =>
      item.checked && item.updatedAt ? (
        <Text size="1" color="gray">
          Completed: {new Date(item.updatedAt).toLocaleDateString()}
        </Text>
      ) : null,
    [],
  );

  return (
    <div className="flex flex-col gap-4 max-w-xl">
      <div>
        <Heading size="4" mb="2">
          Generic checklist
        </Heading>
        <Text size="2" color="gray">
          <code>CheckList</code> only knows about checkboxes, editable titles,
          notes/due dates and drag order. It has no idea this demo is using a{' '}
          <code>{URGENT_PREFIX}</code> title convention for the red accent —
          that comes entirely from the <code>itemClassName</code> and{' '}
          <code>renderItemAccessory</code> props below.
        </Text>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <Switch
            checked={enableDragDrop}
            onCheckedChange={setEnableDragDrop}
          />
          {CONTROL_LABEL.DRAG_DROP}
        </label>
        <Button variant="secondary" size="sm" onClick={handleReset}>
          {CONTROL_LABEL.RESET}
        </Button>
      </div>

      <div className="flex gap-2">
        <Input
          value={newItemTitle}
          placeholder={ADD_PLACEHOLDER}
          onChange={e => setNewItemTitle(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') handleAddItem();
          }}
        />
        <Button onClick={handleAddItem} disabled={!newItemTitle.trim()}>
          {ADD_LABEL}
        </Button>
      </div>

      <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
        <CheckList
          items={items}
          editingItemId={editingItemId}
          editingItemTitle={editingItemTitle}
          onToggleCheck={handleToggleCheck}
          onStartEdit={handleStartEdit}
          onEditChange={setEditingItemTitle}
          onSaveEdit={handleSaveEdit}
          onCancelEdit={handleCancelEdit}
          enableDragDrop={enableDragDrop}
          listId={LIST_ID}
          emptyLabel={EMPTY_LABEL}
          renderItemAccessory={renderItemAccessory}
          renderItemMeta={renderItemMeta}
          itemClassName={itemClassName}
        />
      </DndContext>
    </div>
  );
};
