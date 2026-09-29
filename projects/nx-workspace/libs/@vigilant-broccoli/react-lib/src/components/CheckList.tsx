'use client';
import { ReactNode, memo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DragHandleDots2Icon } from '@radix-ui/react-icons';
import { Checkbox } from './Checkbox';
import { CollapsibleList } from './CollapsibleList';
import { Text } from './Text';
import { Textarea } from './Textarea';

const ANIMATION_STYLES = `
  @keyframes slideInAndFadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .checklist-item-new {
    animation: slideInAndFadeIn 0.3s ease-out;
  }
`;

const DRAG_OPACITY = {
  DRAGGING: 0.5,
  DEFAULT: 1,
} as const;

const PLACEHOLDER_PREFIX = 'placeholder-';

const DEFAULT_LIST_ID = 'default';

const DEFAULT_EMPTY_LABEL = 'No items to display';

export interface CheckListItem {
  id: string;
  title: string;
  checked: boolean;
  notes?: string;
  due?: string;
  updatedAt?: string;
  isNew?: boolean;
  isRemoving?: boolean;
}

export interface CheckListDragOverItem {
  id: string;
  title: string;
}

export interface CheckListProps {
  items: CheckListItem[];
  loading?: boolean;
  error?: string | null;
  editingItemId?: string | null;
  editingItemTitle?: string;
  onToggleCheck: (item: CheckListItem) => void;
  onStartEdit: (item: CheckListItem) => void;
  onEditChange: (title: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  enableDragDrop?: boolean;
  listId?: string;
  dragOverItem?: CheckListDragOverItem | null;
  emptyLabel?: string;
  renderItemAccessory?: (item: CheckListItem) => ReactNode;
  renderItemMeta?: (item: CheckListItem) => ReactNode;
  itemClassName?: (item: CheckListItem) => string;
}

const getActiveItems = (items: CheckListItem[]) =>
  items.filter(item => !item.checked || item.isRemoving);

const getCompletedItems = (items: CheckListItem[]) =>
  items
    .filter(item => item.checked && !item.isRemoving)
    .sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''));

const CheckListRowContent = memo(
  ({
    item,
    isEditing,
    editingTitle,
    onStartEdit,
    onEditChange,
    onSaveEdit,
    onCancelEdit,
    renderItemMeta,
  }: {
    item: CheckListItem;
    isEditing: boolean;
    editingTitle: string;
    onStartEdit: (item: CheckListItem) => void;
    onEditChange: (value: string) => void;
    onSaveEdit: () => void;
    onCancelEdit: () => void;
    renderItemMeta?: (item: CheckListItem) => ReactNode;
  }) => (
    <div className="flex flex-col gap-1 flex-1">
      {isEditing ? (
        <Textarea
          value={editingTitle}
          rows={2}
          onChange={e => onEditChange(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSaveEdit();
            } else if (e.key === 'Escape') onCancelEdit();
          }}
          onBlur={onSaveEdit}
          className="min-h-0 resize-none"
          autoFocus
        />
      ) : (
        <Text
          size="2"
          className={
            item.checked
              ? 'line-through text-gray-400 cursor-pointer'
              : 'cursor-pointer'
          }
          onClick={() => onStartEdit(item)}
        >
          {item.title}
        </Text>
      )}
      {item.notes && (
        <Text size="1" color="gray">
          {item.notes}
        </Text>
      )}
      {item.due && (
        <Text size="1" color="blue">
          Due: {new Date(item.due).toLocaleDateString()}
        </Text>
      )}
      {renderItemMeta?.(item)}
    </div>
  ),
);

CheckListRowContent.displayName = 'CheckListRowContent';

interface CheckListRowProps {
  item: CheckListItem;
  isEditing: boolean;
  editingTitle: string;
  onToggleCheck: (item: CheckListItem) => void;
  onStartEdit: (item: CheckListItem) => void;
  onEditChange: (title: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  enableDragDrop?: boolean;
  listId?: string;
  renderItemAccessory?: (item: CheckListItem) => ReactNode;
  renderItemMeta?: (item: CheckListItem) => ReactNode;
  itemClassName?: (item: CheckListItem) => string;
}

const CheckListRow = memo(
  ({
    item,
    isEditing,
    editingTitle,
    onToggleCheck,
    onStartEdit,
    onEditChange,
    onSaveEdit,
    onCancelEdit,
    enableDragDrop = false,
    listId,
    renderItemAccessory,
    renderItemMeta,
    itemClassName,
  }: CheckListRowProps) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id: item.id,
      // Kept as `type: 'task'` / `task` / `taskListId` (rather than a
      // generic `item`/`listId`) on purpose: apps/ui/vb-manager-next's
      // kanban.component.tsx reads this exact shape off the raw dnd-kit
      // drag payload to move tasks across lanes. See the Nuances entry in
      // that app's CLAUDE.md before renaming any of these keys.
      data: { type: 'task', task: item, taskListId: listId },
      disabled: !enableDragDrop || isEditing,
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? DRAG_OPACITY.DRAGGING : DRAG_OPACITY.DEFAULT,
    };

    const isDraggable = enableDragDrop && !isEditing;

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`flex items-start gap-2 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded px-2 -mx-2 ${
          itemClassName?.(item) ?? ''
        } ${item.isNew ? 'checklist-item-new' : ''}`}
      >
        {isDraggable && (
          <div
            {...listeners}
            {...attributes}
            className="cursor-grab active:cursor-grabbing opacity-50 hover:opacity-100 transition-opacity"
          >
            <DragHandleDots2Icon />
          </div>
        )}
        <Checkbox
          checked={item.checked}
          onCheckedChange={() => onToggleCheck(item)}
          disabled={item.isRemoving}
          className="mt-0.5"
        />
        <div className="flex-1 flex items-start gap-2">
          <CheckListRowContent
            item={item}
            isEditing={isEditing}
            editingTitle={editingTitle}
            onStartEdit={onStartEdit}
            onEditChange={onEditChange}
            onSaveEdit={onSaveEdit}
            onCancelEdit={onCancelEdit}
            renderItemMeta={renderItemMeta}
          />
          {renderItemAccessory?.(item)}
        </div>
      </div>
    );
  },
);

CheckListRow.displayName = 'CheckListRow';

const CheckListPlaceholder = ({
  id,
  title,
  listId,
}: {
  id: string;
  title: string;
  listId?: string;
}) => {
  const placeholderId = `${PLACEHOLDER_PREFIX}${id}`;
  const { setNodeRef, transform, transition } = useSortable({
    id: placeholderId,
    data: { type: 'task', taskListId: listId },
    disabled: true,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 py-2 px-2 -mx-2 rounded border-2 border-dashed border-blue-400 bg-blue-50 dark:bg-blue-950 opacity-70"
    >
      <Text size="2" color="gray" className="truncate">
        {title}
      </Text>
    </div>
  );
};

export const CheckList = memo(
  ({
    items,
    loading = false,
    error = null,
    editingItemId = null,
    editingItemTitle = '',
    onToggleCheck,
    onStartEdit,
    onEditChange,
    onSaveEdit,
    onCancelEdit,
    enableDragDrop,
    listId,
    dragOverItem,
    emptyLabel = DEFAULT_EMPTY_LABEL,
    renderItemAccessory,
    renderItemMeta,
    itemClassName,
  }: CheckListProps) => {
    const { setNodeRef, isOver } = useDroppable({
      id: listId || DEFAULT_LIST_ID,
      // See the comment in CheckListRow: kept as `type: 'taskList'` /
      // `taskListId` for kanban.component.tsx's cross-lane drag handlers.
      data: { type: 'taskList', taskListId: listId },
    });

    if (loading) {
      return (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-200 dark:bg-gray-700 h-10 rounded"
            />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <Text size="2" color="red">
          {error}
        </Text>
      );
    }

    const activeItems = getActiveItems(items);
    const completedItems = getCompletedItems(items);

    const showPlaceholder =
      dragOverItem && !activeItems.some(item => item.id === dragOverItem.id);

    const sortableIds: string[] = activeItems.map(item => item.id);
    if (showPlaceholder)
      sortableIds.push(`${PLACEHOLDER_PREFIX}${dragOverItem.id}`);

    const highlightClass = isOver
      ? 'bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-400 ring-inset'
      : '';

    const renderRow = (item: CheckListItem, draggable: boolean) => (
      <CheckListRow
        key={item.id}
        item={item}
        isEditing={editingItemId === item.id}
        editingTitle={editingItemTitle}
        onToggleCheck={onToggleCheck}
        onStartEdit={onStartEdit}
        onEditChange={onEditChange}
        onSaveEdit={onSaveEdit}
        onCancelEdit={onCancelEdit}
        enableDragDrop={draggable}
        listId={listId}
        renderItemAccessory={renderItemAccessory}
        renderItemMeta={renderItemMeta}
        itemClassName={itemClassName}
      />
    );

    return (
      <>
        <style>{ANIMATION_STYLES}</style>
        <div
          ref={setNodeRef}
          className={`rounded-lg transition-all duration-150 min-h-[60px] ${highlightClass}`}
        >
          <SortableContext
            items={sortableIds}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-2">
              {activeItems.length === 0 && !showPlaceholder && (
                <Text size="2" color="gray">
                  {emptyLabel}
                </Text>
              )}
              {activeItems.map(item => renderRow(item, !!enableDragDrop))}
              {showPlaceholder && (
                <CheckListPlaceholder
                  id={dragOverItem.id}
                  title={dragOverItem.title}
                  listId={listId}
                />
              )}
            </div>
          </SortableContext>
          {completedItems.length > 0 && (
            <CollapsibleList
              storageKeyPrefix={`checklist-${listId ?? DEFAULT_LIST_ID}`}
              items={[
                {
                  id: `${listId ?? DEFAULT_LIST_ID}-completed`,
                  title: `Completed (${completedItems.length})`,
                  content: (
                    <div className="flex flex-col gap-2">
                      {completedItems.map(item => renderRow(item, false))}
                    </div>
                  ),
                },
              ]}
            />
          )}
        </div>
      </>
    );
  },
);

CheckList.displayName = 'CheckList';
