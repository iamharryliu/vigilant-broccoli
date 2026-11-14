'use client';
import { ReactNode, memo, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  closestCenter,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DragHandleDots2Icon } from '@radix-ui/react-icons';
import {
  CheckListBase,
  CheckListBaseItem,
  CheckListEditor,
  CheckListRowFrameProps,
  CheckListRowVariant,
} from './CheckListBase';
import { EllipsisAction } from './EllipsisCTA';
import { Text } from './Text';

const DRAG_OPACITY = {
  DRAGGING: 0.5,
  DEFAULT: 1,
} as const;

const PLACEHOLDER_PREFIX = 'placeholder-';

const DEFAULT_LIST_ID = 'default';

const DEFAULT_EMPTY_LABEL = 'No items to display';

const DRAG_HANDLE_LABEL_PREFIX = 'Reorder ';

export interface CheckListItem extends CheckListBaseItem {
  notes?: string;
  due?: string;
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
  editor?: CheckListEditor;
  rowVariant?: CheckListRowVariant;
  size?: '1' | '2' | '3';
  editCompleted?: boolean;
  storageKeyPrefix?: string;
  completedSectionId?: string;
  /** Rendered after the completed rows, e.g. a control to load older ones. */
  completedFooter?: ReactNode;
  /** Shows Completed with a skeleton count and rows while its items load. */
  completedLoading?: boolean;
  /** Muted text after the Completed count, e.g. the range it covers. */
  completedHint?: string;
  enableDragDrop?: boolean;
  /**
   * Standalone reordering: enables the drag handles, wraps the list in its own
   * `DndContext` and reports the new order of the active rows. Omit it when the
   * consumer supplies a `DndContext` (kanban, hearth) and handles `onDragEnd`.
   */
  onReorder?: (orderedActiveIds: string[]) => void;
  listId?: string;
  dragOverItem?: CheckListDragOverItem | null;
  emptyLabel?: ReactNode;
  renderItemAccessory?: (item: CheckListItem) => ReactNode;
  renderItemMeta?: (item: CheckListItem) => ReactNode;
  itemClassName?: (item: CheckListItem) => string;
  onDeleteItem?: (item: CheckListItem) => void | Promise<void>;
  canDeleteItem?: (item: CheckListItem) => boolean;
  deleteLabel?: string;
  itemActions?: (item: CheckListItem) => EllipsisAction[];
}

const renderItemDetails = (item: CheckListItem) => (
  <>
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
  </>
);

const SortableRowFrame = ({
  item,
  className,
  isEditing,
  isActive,
  enableDragDrop,
  listId,
  children,
}: CheckListRowFrameProps<CheckListItem> & {
  enableDragDrop: boolean;
  listId?: string;
}) => {
  const draggable = enableDragDrop && isActive;
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
    // generic `item`/`listId`) on purpose: apps/ui/local-manager-next's
    // kanban.component.tsx reads this exact shape off the raw dnd-kit
    // drag payload to move tasks across lanes. See the Nuances entry in
    // that app's CONTEXT.md before renaming any of these keys.
    data: { type: 'task', task: item, taskListId: listId },
    disabled: !draggable || isEditing || item.isRemoving,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? DRAG_OPACITY.DRAGGING : DRAG_OPACITY.DEFAULT,
  };

  return (
    <div ref={setNodeRef} style={style} className={className}>
      {draggable && !isEditing && (
        <div
          {...listeners}
          {...attributes}
          aria-label={`${DRAG_HANDLE_LABEL_PREFIX}${item.title}`}
          className="cursor-grab touch-none active:cursor-grabbing opacity-50 hover:opacity-100 transition-opacity"
        >
          <DragHandleDots2Icon />
        </div>
      )}
      {children}
    </div>
  );
};

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
    editor,
    rowVariant,
    size,
    editCompleted,
    storageKeyPrefix,
    completedSectionId,
    completedFooter,
    completedLoading,
    completedHint,
    enableDragDrop,
    onReorder,
    listId,
    dragOverItem,
    emptyLabel = DEFAULT_EMPTY_LABEL,
    renderItemAccessory,
    renderItemMeta,
    itemClassName,
    onDeleteItem,
    canDeleteItem,
    deleteLabel,
    itemActions,
  }: CheckListProps) => {
    const { setNodeRef, isOver } = useDroppable({
      id: listId || DEFAULT_LIST_ID,
      // See the comment in CheckListRow: kept as `type: 'taskList'` /
      // `taskListId` for kanban.component.tsx's cross-lane drag handlers.
      data: { type: 'taskList', taskListId: listId },
    });

    const rowFrame = useCallback(
      (props: CheckListRowFrameProps<CheckListItem>) => (
        <SortableRowFrame
          {...props}
          enableDragDrop={!!enableDragDrop || !!onReorder}
          listId={listId}
        />
      ),
      [enableDragDrop, onReorder, listId],
    );

    if (loading) {
      return (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-muted h-10 rounded" />
          ))}
        </div>
      );
    }

    if (error && items.length === 0) {
      return (
        <Text size="2" color="red">
          {error}
        </Text>
      );
    }

    const activeItems = items.filter(item => !item.checked);

    const showPlaceholder =
      dragOverItem && !activeItems.some(item => item.id === dragOverItem.id);

    const highlightClass = isOver
      ? 'bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-400 ring-inset'
      : '';

    const resolvedListId = listId ?? DEFAULT_LIST_ID;
    const resolvedStorageKeyPrefix =
      storageKeyPrefix ?? `checklist-${resolvedListId}`;
    const resolvedCompletedSectionId =
      completedSectionId ?? `${resolvedListId}-completed`;

    const handleDragEnd = ({ active, over }: DragEndEvent) => {
      if (!over || active.id === over.id) return;
      const ids = activeItems.map(item => item.id);
      const from = ids.indexOf(String(active.id));
      const to = ids.indexOf(String(over.id));
      if (from < 0 || to < 0) return;
      onReorder?.(arrayMove(ids, from, to));
    };

    const withReorder = (list: ReactNode) =>
      onReorder ? (
        <DndContext
          onDragEnd={handleDragEnd}
          collisionDetection={closestCenter}
        >
          {list}
        </DndContext>
      ) : (
        list
      );

    return (
      <>
        {error && (
          <Text size="2" color="red" role="alert">
            {error}
          </Text>
        )}
        {withReorder(
          <div
            ref={setNodeRef}
            className={`rounded-lg transition-all duration-150 min-h-[60px] ${highlightClass}`}
          >
            <CheckListBase
              items={items}
              editingItemId={editingItemId}
              editingItemTitle={editingItemTitle}
              onToggleCheck={onToggleCheck}
              onStartEdit={onStartEdit}
              onEditChange={onEditChange}
              onSaveEdit={onSaveEdit}
              onCancelEdit={onCancelEdit}
              editor={editor}
              rowVariant={rowVariant}
              size={size}
              editCompleted={editCompleted}
              storageKeyPrefix={resolvedStorageKeyPrefix}
              completedSectionId={resolvedCompletedSectionId}
              completedFooter={completedFooter}
              completedLoading={completedLoading}
              completedHint={completedHint}
              emptyLabel={
                typeof emptyLabel === 'string' ? (
                  <Text size="2" color="gray">
                    {emptyLabel}
                  </Text>
                ) : (
                  emptyLabel
                )
              }
              renderItemAccessory={renderItemAccessory}
              renderItemMeta={renderItemMeta}
              renderItemDetails={renderItemDetails}
              itemClassName={itemClassName}
              onDeleteItem={onDeleteItem}
              canDeleteItem={canDeleteItem}
              deleteLabel={deleteLabel}
              itemActions={itemActions}
              rowFrame={rowFrame}
              wrapActiveItems={(rows, activeIds) => (
                <SortableContext
                  items={
                    showPlaceholder
                      ? [
                          ...activeIds,
                          `${PLACEHOLDER_PREFIX}${dragOverItem.id}`,
                        ]
                      : activeIds
                  }
                  strategy={verticalListSortingStrategy}
                >
                  {rows}
                </SortableContext>
              )}
              activeFooter={
                showPlaceholder ? (
                  <CheckListPlaceholder
                    id={dragOverItem.id}
                    title={dragOverItem.title}
                    listId={listId}
                  />
                ) : undefined
              }
            />
          </div>,
        )}
      </>
    );
  },
);

CheckList.displayName = 'CheckList';
