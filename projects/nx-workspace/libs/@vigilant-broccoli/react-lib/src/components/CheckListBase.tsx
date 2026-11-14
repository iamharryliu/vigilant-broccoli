'use client';
import {
  ComponentType,
  KeyboardEvent,
  ReactNode,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { cn } from '../utils/cn';
import { Checkbox } from './Checkbox';
import { groupCompletedByDay } from './checklist-groups.utils';
import { CollapsibleList } from './CollapsibleList';
import { EllipsisAction, EllipsisCTA } from './EllipsisCTA';
import { Input } from './Input';
import { Skeleton } from './Skeleton';
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
const COMPLETED_LABEL = 'Completed';
const COMPLETED_SKELETON_ROWS = 3;

const DEFAULT_DELETE_LABEL = 'Delete';

const COMPLETION_DURATION = 400;
const ENTER_DURATION = 300;
const COMPLETION_STYLES = `
  .checklist-item-new { animation: checklist-enter 300ms ease-out; }
  @keyframes checklist-enter { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
  .checklist-transition { display: grid; grid-template-rows: 1fr; transition: grid-template-rows 400ms ease, opacity 400ms ease; }
  .checklist-transition-content { min-height: 0; }
  .checklist-transition:last-child .checklist-dense-row { border-bottom: 0; }
  .checklist-departing { grid-template-rows: 0fr; opacity: 0; }
  .checklist-departing > .checklist-transition-content, .checklist-arriving > .checklist-transition-content { overflow: hidden; }
  .checklist-arriving { animation: checklist-arrive 400ms ease-out; }
  @keyframes checklist-arrive { from { grid-template-rows: 0fr; opacity: 0; translate: 0 -4px; } to { grid-template-rows: 1fr; opacity: 1; translate: 0 0; } }
  .checklist-populating { animation: checklist-populate 200ms ease-out backwards; }
  @keyframes checklist-populate { from { opacity: 0; translate: 0 -6px; } to { opacity: 1; translate: 0 0; } }
  @media (prefers-reduced-motion: reduce) {
    .checklist-transition { transition: none; }
    .checklist-arriving, .checklist-populating, .checklist-item-new { animation: none; }
  }
`;

export interface CheckListBaseItem {
  id: string;
  title: string;
  checked: boolean;
  completedAt?: string | null;
  updatedAt?: string;
  /** Forces the slide-in; rows added after mount slide in without it. */
  isNew?: boolean;
  /** Prevents repeated toggles while persistence is pending. */
  isRemoving?: boolean;
  /**
   * Id of the row this item replaces in the same update, e.g. a temporary id
   * swapped for a saved one. The row keeps its transition instead of sliding
   * in as new, and plays the completion transition if `checked` differs.
   */
  transitionFromId?: string;
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
  wrapActiveItems?: (rows: ReactNode, activeIds: string[]) => ReactNode;
  /** Rendered after the active rows, e.g. a drag placeholder. */
  activeFooter?: ReactNode;
  /** Rendered after the completed rows; keeps Completed visible when empty. */
  completedFooter?: ReactNode;
  /** Shows Completed with a skeleton count and rows while its items load. */
  completedLoading?: boolean;
  /** Muted text after the Completed count, e.g. the range it covers. */
  completedHint?: string;
  /** Rendered under the title, above `renderItemMeta`. */
  renderItemDetails?: (item: T) => ReactNode;
  /**
   * Adds a confirmed Delete entry to the row's trailing ellipsis menu. The
   * menu renders only for rows with at least one action.
   */
  onDeleteItem?: (item: T) => void | Promise<void>;
  /** Limits Delete to some rows; every row is deletable when omitted. */
  canDeleteItem?: (item: T) => boolean;
  deleteLabel?: string;
  /** Extra ellipsis menu entries, listed above Delete. */
  itemActions?: (item: T) => EllipsisAction[];
}

const DefaultRowFrame = ({
  className,
  children,
}: CheckListRowFrameProps<CheckListBaseItem>) => (
  <div className={className}>{children}</div>
);

const getActiveItems = <T extends CheckListBaseItem>(items: T[]) =>
  items.filter(item => !item.checked);

const getCompletedStamp = ({ completedAt, updatedAt }: CheckListBaseItem) =>
  completedAt ?? updatedAt;

const MAX_POPULATE_STAGGER = 8;
const POPULATE_STAGGER_MS = 30;

const populateDelay = (index: number) =>
  `${Math.min(index, MAX_POPULATE_STAGGER) * POPULATE_STAGGER_MS}ms`;

const toIdentityKeys = <T extends CheckListBaseItem>(items: T[]) =>
  new Map(items.map(({ id }) => [id, id]));

const freeKey = (id: string, used: Set<string>) => {
  let suffix = 1;
  while (used.has(`${id}:${suffix}`)) suffix++;
  return `${id}:${suffix}`;
};

/**
 * Row keys outlive item ids: an item continuing a removed row (via
 * `transitionFromId`) inherits that row's key, so its DOM node and pending
 * transition survive the re-key. Existing rows claim their keys first, and a
 * new id that collides with a key still in use gets a suffixed one.
 */
const assignRowKeys = <T extends CheckListBaseItem>(
  items: T[],
  committed: Map<string, string>,
) => {
  const ids = new Set(items.map(({ id }) => id));
  const keys = new Map<string, string>();
  const used = new Set<string>();
  items.forEach(({ id }) => {
    const key = committed.get(id);
    if (key === undefined) return;
    keys.set(id, key);
    used.add(key);
  });
  items.forEach(({ id, transitionFromId }) => {
    if (keys.has(id)) return;
    const inherited =
      transitionFromId !== undefined && !ids.has(transitionFromId)
        ? committed.get(transitionFromId)
        : undefined;
    const key =
      inherited !== undefined && !used.has(inherited)
        ? inherited
        : used.has(id)
          ? freeKey(id, used)
          : id;
    keys.set(id, key);
    used.add(key);
  });
  return keys;
};

const ROW_CLASS = {
  [ROW_VARIANT.CARD]:
    'flex items-start gap-2 py-2 hover:bg-muted dark:hover:bg-muted rounded px-2 -mx-2',
  [ROW_VARIANT.DENSE]:
    'flex items-center gap-3 py-1.5 border-b border-[var(--gray-a4)]',
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

// Card rows align to the top, so the 36px menu trigger is pulled up to center
// on the title's first 20px line instead of hanging below it and growing the row.
const ROW_MENU_CLASS = {
  [ROW_VARIANT.CARD]: 'shrink-0 -my-2',
  [ROW_VARIANT.DENSE]: 'shrink-0',
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
  completedFooter,
  completedLoading = false,
  completedHint,
  renderItemDetails,
  onDeleteItem,
  canDeleteItem,
  deleteLabel = DEFAULT_DELETE_LABEL,
  itemActions,
}: CheckListBaseProps<T>) => {
  const Frame = (rowFrame ?? DefaultRowFrame) as ComponentType<
    CheckListRowFrameProps<T>
  >;

  const container = useRef<HTMLDivElement>(null);
  const focusedItem = useRef<string | null>(null);
  // Transition state is keyed by row key (see assignRowKeys), not item id.
  const committedKeys = useRef(toIdentityKeys(items));
  const previous = useRef(new Map(items.map(item => [item.id, item.checked])));
  // Last completion timestamp per row key, so a row leaving Completed stays
  // in its day group while it collapses even if the item dropped the stamp.
  const completedStamps = useRef(
    new Map(
      items.flatMap(item => {
        const stamp = item.checked ? getCompletedStamp(item) : undefined;
        return stamp ? [[item.id, stamp] as const] : [];
      }),
    ),
  );
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const [departing, setDeparting] = useState(new Map<string, boolean>());
  const [arriving, setArriving] = useState(new Set<string>());
  const [entering, setEntering] = useState(new Set<string>());
  const [populating, setPopulating] = useState(false);

  const rowKeys = useMemo(
    () => assignRowKeys(items, committedKeys.current),
    [items],
  );
  const keyOf = (item: T) => rowKeys.get(item.id) ?? item.id;

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useLayoutEffect(() => {
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const without = (key: string) => (current: Set<string>) => {
      const next = new Set(current);
      next.delete(key);
      return next;
    };
    items.forEach(item => {
      const key = rowKeys.get(item.id) ?? item.id;
      const wasChecked = previous.current.get(key);
      // Rows present at mount are in `previous`, so only later additions
      // slide in.
      if (wasChecked === undefined) {
        setEntering(current => new Set(current).add(key));
        timers.current.set(
          key,
          setTimeout(() => {
            setEntering(without(key));
            timers.current.delete(key);
          }, ENTER_DURATION),
        );
        return;
      }
      if (wasChecked === item.checked) return;
      const focusedRow = document.activeElement?.closest<HTMLElement>(
        '[data-checklist-id]',
      );
      if (
        focusedRow &&
        container.current?.contains(focusedRow) &&
        focusedRow.dataset.checklistId === key
      )
        focusedItem.current = key;
      clearTimeout(timers.current.get(key));
      setEntering(without(key));
      setArriving(without(key));
      setDeparting(current =>
        new Map(current).set(key, current.get(key) ?? wasChecked),
      );
      timers.current.set(
        key,
        setTimeout(
          () => {
            setDeparting(current => {
              const next = new Map(current);
              next.delete(key);
              return next;
            });
            setArriving(current => new Set(current).add(key));
            timers.current.set(
              key,
              setTimeout(() => {
                setArriving(without(key));
                timers.current.delete(key);
              }, COMPLETION_DURATION),
            );
          },
          reducedMotion ? 0 : COMPLETION_DURATION,
        ),
      );
    });
    previous.current = new Map(
      items.map(item => [rowKeys.get(item.id) ?? item.id, item.checked]),
    );
    completedStamps.current = new Map(
      items.flatMap(item => {
        const key = rowKeys.get(item.id) ?? item.id;
        const stamp = item.checked
          ? getCompletedStamp(item)
          : completedStamps.current.get(key);
        return stamp ? [[key, stamp] as const] : [];
      }),
    );
    committedKeys.current = rowKeys;
  }, [items, rowKeys]);

  useLayoutEffect(() => {
    const key = focusedItem.current;
    if (!key || departing.has(key) || !arriving.has(key)) return;
    const row = Array.from(
      container.current?.querySelectorAll<HTMLElement>('[data-checklist-id]') ??
        [],
    ).find(element => element.dataset.checklistId === key);
    const target =
      row?.querySelector<HTMLElement>(
        'button[role="checkbox"]:not(:disabled), button:not(:disabled)',
      ) ??
      container.current?.querySelector<HTMLElement>(
        '[data-radix-collection-item]',
      );
    if (
      document.activeElement === document.body ||
      container.current?.contains(document.activeElement)
    )
      target?.focus({ preventScroll: true });
    focusedItem.current = null;
  }, [departing, arriving]);

  const presentationItems = items.map(item => {
    const key = keyOf(item);
    const checked =
      departing.get(key) ?? previous.current.get(key) ?? item.checked;
    const leavingCompleted = checked && !item.checked;
    return {
      ...item,
      checked,
      ...(leavingCompleted &&
        completedStamps.current.has(key) && {
          completedAt: completedStamps.current.get(key),
        }),
    };
  });
  const activeItems = getActiveItems(presentationItems);
  const completedGroups = groupCompletedByDay(
    presentationItems.filter(item => item.checked),
  );
  const completedCount = items.filter(item => item.checked).length;
  const completedTitle = `${COMPLETED_LABEL} (${completedCount})`;

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

  const getRowActions = (item: T): EllipsisAction[] => [
    ...(itemActions?.(item) ?? []),
    ...(onDeleteItem && (canDeleteItem?.(item) ?? true)
      ? [
          {
            label: deleteLabel,
            color: 'red' as const,
            onSelect: () => onDeleteItem(item),
            confirm: { confirmLabel: deleteLabel },
          },
        ]
      : []),
  ];

  const renderRow = (
    presentationItem: T,
    isActive: boolean,
    populateIndex?: number,
  ) => {
    const item =
      items.find(current => current.id === presentationItem.id) ??
      presentationItem;
    const key = keyOf(item);
    const isEditing = editingItemId === item.id;
    const canEdit = editCompleted || !item.checked;
    const actions = getRowActions(item);
    return (
      <div
        key={key}
        data-checklist-id={key}
        className={cn(
          'checklist-transition',
          departing.has(key) && 'checklist-departing',
          arriving.has(key) && 'checklist-arriving',
          populateIndex !== undefined && 'checklist-populating',
        )}
        style={
          populateIndex !== undefined
            ? { animationDelay: populateDelay(populateIndex) }
            : undefined
        }
      >
        <div className="checklist-transition-content">
          <Frame
            item={item}
            isActive={isActive}
            isEditing={isEditing}
            className={cn(
              ROW_CLASS[rowVariant],
              rowVariant === ROW_VARIANT.DENSE && 'checklist-dense-row',
              itemClassName?.(item),
              (item.isNew || entering.has(key)) && 'checklist-item-new',
            )}
          >
            <Checkbox
              checked={item.checked}
              onCheckedChange={() => {
                if (container.current?.contains(document.activeElement))
                  focusedItem.current = key;
                onToggleCheck(item);
              }}
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
              {actions.length > 0 && (
                <div className={ROW_MENU_CLASS[rowVariant]}>
                  <EllipsisCTA actions={actions} disabled={item.isRemoving} />
                </div>
              )}
            </div>
          </Frame>
        </div>
      </div>
    );
  };

  // Rows keep one stagger sequence across day groups.
  const populateOffsets = new Map(
    completedGroups.map(({ key }, index) => [
      key,
      completedGroups
        .slice(0, index)
        .reduce((total, group) => total + group.items.length, 0),
    ]),
  );

  const activeRows = (
    <div className={LIST_CLASS[rowVariant]}>
      {activeItems.length === 0 && !activeFooter && emptyLabel}
      {activeItems.map(item => renderRow(item, true))}
      {activeFooter}
    </div>
  );

  return (
    <div ref={container} className="contents">
      <style>{COMPLETION_STYLES}</style>
      {wrapActiveItems
        ? wrapActiveItems(
            activeRows,
            activeItems.map(item => item.id),
          )
        : activeRows}
      {(completedGroups.length > 0 || completedFooter || completedLoading) && (
        <CollapsibleList
          storageKeyPrefix={storageKeyPrefix}
          onOpenChange={(_, open) => setPopulating(open)}
          items={[
            {
              id: completedSectionId,
              title: completedTitle,
              titleContent:
                completedLoading || completedHint ? (
                  <span
                    className="flex items-center gap-2 text-sm"
                    aria-busy={completedLoading || undefined}
                  >
                    <span className="font-bold">
                      {completedLoading ? COMPLETED_LABEL : completedTitle}
                    </span>
                    {completedLoading && <Skeleton className="h-4 w-6" />}
                    {completedHint && (
                      <span className="text-muted-foreground">
                        · {completedHint}
                      </span>
                    )}
                  </span>
                ) : undefined,
              content: completedLoading ? (
                <div className="flex flex-col gap-2">
                  {Array.from({ length: COMPLETED_SKELETON_ROWS }).map(
                    (_, i) => (
                      <Skeleton key={i} className="h-8 w-full" />
                    ),
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {completedGroups.map(({ key, label, items: groupItems }) => {
                    const offset = populateOffsets.get(key) ?? 0;
                    return (
                      <div key={key} className="flex flex-col gap-1">
                        {label && (
                          <Text
                            as="div"
                            size="1"
                            weight="medium"
                            color="gray"
                            className={cn(populating && 'checklist-populating')}
                            style={
                              populating
                                ? { animationDelay: populateDelay(offset) }
                                : undefined
                            }
                          >
                            {label}
                          </Text>
                        )}
                        <div className={LIST_CLASS[rowVariant]}>
                          {groupItems.map((item, index) =>
                            renderRow(
                              item,
                              false,
                              populating ? offset + index : undefined,
                            ),
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {completedFooter}
                </div>
              ),
            },
          ]}
        />
      )}
    </div>
  );
};
