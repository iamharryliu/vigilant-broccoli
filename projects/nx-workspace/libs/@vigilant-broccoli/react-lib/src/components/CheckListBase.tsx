'use client';
import { ComponentType, KeyboardEvent, ReactNode } from 'react';
import { cn } from '../utils/cn';
import { Checkbox } from './Checkbox';
import { CollapsibleList } from './CollapsibleList';
import { Input } from './Input';
import { Text } from './Text';
import { Textarea } from './Textarea';

const ROW_VARIANT = {
  CARD: 'card',
  DENSE: 'dense',
} as const;

const EDITOR = {
  INPUT: 'input',
  TEXTAREA: 'textarea',
} as const;

const DEFAULT_COMPLETED_SECTION_ID = 'completed';

export interface CheckListBaseItem {
  id: string;
  title: string;
  checked: boolean;
  completedAt?: string | null;
  updatedAt?: string;
  isNew?: boolean;
  /** Keeps a just-checked item in the active section (e.g. while it fades out). */
  isRemoving?: boolean;
}

export type CheckListRowVariant =
  (typeof ROW_VARIANT)[keyof typeof ROW_VARIANT];

export type CheckListEditor = (typeof EDITOR)[keyof typeof EDITOR];

export interface CheckListRowFrameProps<
  T extends CheckListBaseItem = CheckListBaseItem,
> {
  item: T;
  className: string;
  isEditing: boolean;
  /** False for completed rows, so frames can skip drag behavior. */
  isActive: boolean;
  children: ReactNode;
}

export interface CheckListBaseProps<
  T extends CheckListBaseItem = CheckListBaseItem,
> {
  items: T[];
  editingItemId?: string | null;
  editingItemTitle?: string;
  onToggleCheck: (item: T) => void;
  onStartEdit: (item: T) => void;
  onEditChange: (title: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  /** `textarea` suits wrapping card rows, `input` single-line dense rows. */
  editor?: CheckListEditor;
  /** `dense` rows are vertically centered and separated by a divider. */
  rowVariant?: CheckListRowVariant;
  /** Radix text size for titles. */
  size?: '1' | '2' | '3';
  /** Completed rows can still be unchecked, but only editable when true. */
  editCompleted?: boolean;
  emptyLabel?: ReactNode;
  storageKeyPrefix: string;
  completedSectionId?: string;
  renderItemAccessory?: (item: T) => ReactNode;
  renderItemMeta?: (item: T) => ReactNode;
  itemClassName?: (item: T) => string;
  /** Replaces each row's outer element, e.g. to make it sortable. */
  rowFrame?: ComponentType<CheckListRowFrameProps<T>>;
  /** Wraps the active rows, e.g. in a sortable context. */
  wrapActiveItems?: (rows: ReactNode) => ReactNode;
  /** Rendered after the active rows, e.g. a drag placeholder. */
  activeFooter?: ReactNode;
  /** Rendered under the title, above `renderItemMeta`. */
  renderItemDetails?: (item: T) => ReactNode;
}

const DefaultRowFrame = ({
  className,
  children,
}: CheckListRowFrameProps<CheckListBaseItem>) => (
  <div className={className}>{children}</div>
);

const getActiveItems = <T extends CheckListBaseItem>(items: T[]) =>
  items.filter(item => !item.checked || item.isRemoving);

const getCompletedItems = <T extends CheckListBaseItem>(items: T[]) =>
  items
    .filter(item => item.checked && !item.isRemoving)
    .sort((a, b) =>
      (b.completedAt ?? b.updatedAt ?? '').localeCompare(
        a.completedAt ?? a.updatedAt ?? '',
      ),
    );

const ROW_CLASS = {
  [ROW_VARIANT.CARD]:
    'flex items-start gap-2 py-2 hover:bg-muted dark:hover:bg-muted rounded px-2 -mx-2',
  [ROW_VARIANT.DENSE]:
    'flex items-center gap-3 py-1.5 border-b border-[var(--gray-a4)] last:border-b-0',
} as const;

const LIST_CLASS = {
  [ROW_VARIANT.CARD]: 'flex flex-col gap-2',
  [ROW_VARIANT.DENSE]: 'flex flex-col',
} as const;

const CHECKBOX_CLASS = {
  [ROW_VARIANT.CARD]: 'mt-0.5',
  [ROW_VARIANT.DENSE]: 'h-5 w-5 shrink-0',
} as const;

// A real button so keyboard users can reach and start editing a title.
const EDITABLE_TITLE_CLASS =
  'cursor-pointer text-left rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

const COMPLETED_TITLE_CLASS = 'line-through text-muted-foreground';

const BODY_CLASS = {
  [ROW_VARIANT.CARD]: 'items-start gap-2',
  [ROW_VARIANT.DENSE]: 'items-center gap-3',
} as const;

export const CheckListBase = <T extends CheckListBaseItem>({
  items,
  editingItemId = null,
  editingItemTitle = '',
  onToggleCheck,
  onStartEdit,
  onEditChange,
  onSaveEdit,
  onCancelEdit,
  editor = EDITOR.TEXTAREA,
  rowVariant = ROW_VARIANT.CARD,
  size = '2',
  editCompleted = true,
  emptyLabel,
  storageKeyPrefix,
  completedSectionId = DEFAULT_COMPLETED_SECTION_ID,
  renderItemAccessory,
  renderItemMeta,
  itemClassName,
  rowFrame,
  wrapActiveItems,
  activeFooter,
  renderItemDetails,
}: CheckListBaseProps<T>) => {
  const Frame = (rowFrame ?? DefaultRowFrame) as ComponentType<
    CheckListRowFrameProps<T>
  >;

  const activeItems = getActiveItems(items);
  const completedItems = getCompletedItems(items);

  const handleEditKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !(editor === EDITOR.TEXTAREA && e.shiftKey)) {
      e.preventDefault();
      onSaveEdit();
    } else if (e.key === 'Escape') onCancelEdit();
  };

  const renderEditor = () =>
    editor === EDITOR.INPUT ? (
      <Input
        autoFocus
        value={editingItemTitle}
        onChange={e => onEditChange(e.target.value)}
        onKeyDown={handleEditKeyDown}
        onBlur={onSaveEdit}
      />
    ) : (
      <Textarea
        autoFocus
        value={editingItemTitle}
        rows={2}
        onChange={e => onEditChange(e.target.value)}
        onKeyDown={handleEditKeyDown}
        onBlur={onSaveEdit}
        className="min-h-0 resize-none"
      />
    );

  const renderRow = (item: T, isActive: boolean) => {
    const isEditing = editingItemId === item.id;
    const canEdit = editCompleted || !item.checked;
    return (
      <Frame
        key={item.id}
        item={item}
        isActive={isActive}
        isEditing={isEditing}
        className={cn(
          ROW_CLASS[rowVariant],
          itemClassName?.(item),
          item.isNew && 'checklist-item-new',
        )}
      >
        <Checkbox
          checked={item.checked}
          onCheckedChange={() => onToggleCheck(item)}
          disabled={item.isRemoving}
          className={CHECKBOX_CLASS[rowVariant]}
          aria-label={item.title}
        />
        <div className={cn('flex flex-1', BODY_CLASS[rowVariant])}>
          <div className="flex flex-col gap-1 flex-1">
            {isEditing ? (
              renderEditor()
            ) : canEdit ? (
              <Text
                asChild
                size={size}
                className={cn(
                  EDITABLE_TITLE_CLASS,
                  item.checked && COMPLETED_TITLE_CLASS,
                )}
              >
                <button type="button" onClick={() => onStartEdit(item)}>
                  {item.title}
                </button>
              </Text>
            ) : (
              <Text
                size={size}
                className={cn(item.checked && COMPLETED_TITLE_CLASS)}
              >
                {item.title}
              </Text>
            )}
            {renderItemDetails?.(item)}
            {renderItemMeta?.(item)}
          </div>
          {renderItemAccessory?.(item)}
        </div>
      </Frame>
    );
  };

  const activeRows = (
    <div className={LIST_CLASS[rowVariant]}>
      {activeItems.length === 0 && !activeFooter && emptyLabel}
      {activeItems.map(item => renderRow(item, true))}
      {activeFooter}
    </div>
  );

  return (
    <>
      {wrapActiveItems ? wrapActiveItems(activeRows) : activeRows}
      {completedItems.length > 0 && (
        <CollapsibleList
          storageKeyPrefix={storageKeyPrefix}
          items={[
            {
              id: completedSectionId,
              title: `Completed (${completedItems.length})`,
              content: (
                <div className={LIST_CLASS[rowVariant]}>
                  {completedItems.map(item => renderRow(item, false))}
                </div>
              ),
            },
          ]}
        />
      )}
    </>
  );
};
