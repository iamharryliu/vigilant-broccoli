import type {
  Active,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  Over,
} from '@dnd-kit/core';
import { arrayMove, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ComponentPropsWithoutRef, ReactNode, useState } from 'react';
import { cn } from '../utils/cn';
import { KanbanLaneFrame } from './KanbanLaneFrame';

export const KANBAN_LANE_DRAG_TYPE = 'kanban-lane';

type LaneItem = { id: string };

type UseKanbanLaneReorderOptions<TLane extends LaneItem> = {
  lanes: TLane[];
  onReorder: (lanes: TLane[]) => void;
  // Maps whatever the lane is hovering (a card, a task list) to the lane that owns it.
  resolveOverLaneId?: (over: Over, lanes: TLane[]) => string | undefined;
};

const isLaneDrag = (active: Active) =>
  active.data.current?.type === KANBAN_LANE_DRAG_TYPE;

const defaultResolveOverLaneId = (over: Over) =>
  over.data.current?.type === KANBAN_LANE_DRAG_TYPE
    ? String(over.id)
    : undefined;

/**
 * Lane reordering for a board that owns its own `DndContext`: forward the
 * context's events here and render `lanes` (the live preview order) inside a
 * `SortableContext`. Each handler returns whether the event was a lane drag.
 */
export const useKanbanLaneReorder = <TLane extends LaneItem>({
  lanes,
  onReorder,
  resolveOverLaneId = defaultResolveOverLaneId,
}: UseKanbanLaneReorderOptions<TLane>) => {
  const [activeLane, setActiveLane] = useState<TLane | null>(null);
  const [draggingLanes, setDraggingLanes] = useState<TLane[] | null>(null);

  const reset = () => {
    setActiveLane(null);
    setDraggingLanes(null);
  };

  const onDragStart = ({ active }: DragStartEvent) => {
    if (!isLaneDrag(active)) return false;
    setActiveLane(active.data.current?.lane ?? null);
    setDraggingLanes(lanes);
    return true;
  };

  const onDragOver = ({ active, over }: DragOverEvent) => {
    if (!isLaneDrag(active)) return false;
    if (!over) return true;
    setDraggingLanes(prev => {
      if (!prev) return prev;
      const overLaneId = resolveOverLaneId(over, prev);
      if (!overLaneId) return prev;
      const oldIndex = prev.findIndex(lane => lane.id === active.id);
      const newIndex = prev.findIndex(lane => lane.id === overLaneId);
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex)
        return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
    return true;
  };

  const onDragEnd = ({ active }: DragEndEvent) => {
    if (!isLaneDrag(active)) return false;
    if (draggingLanes) onReorder(draggingLanes);
    reset();
    return true;
  };

  const onDragCancel = reset;

  return {
    lanes: draggingLanes ?? lanes,
    activeLane,
    onDragStart,
    onDragOver,
    onDragEnd,
    onDragCancel,
  };
};

type DragHandleProps = ComponentPropsWithoutRef<'div'>;

type KanbanSortableLaneProps<TLane extends LaneItem> = Omit<
  ComponentPropsWithoutRef<'section'>,
  'children' | 'title'
> & {
  lane: TLane;
  isOver?: boolean;
  header?: (dragHandleProps: DragHandleProps) => ReactNode;
  footer?: ReactNode;
  children: ReactNode | ((dragHandleProps: DragHandleProps) => ReactNode);
};

export const KanbanSortableLane = <TLane extends LaneItem>({
  lane,
  isOver,
  header,
  footer,
  className,
  style,
  children,
  ...rest
}: KanbanSortableLaneProps<TLane>) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: lane.id,
    data: { type: KANBAN_LANE_DRAG_TYPE, lane },
  });

  const sortableStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...style,
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={sortableStyle}
        className={cn(
          'h-64 shrink-0 rounded-lg border-2 border-dashed border-blue-400 bg-blue-50 opacity-50 dark:bg-blue-950',
          className,
        )}
      />
    );
  }

  const dragHandleProps = { ...attributes, ...listeners };

  return (
    <KanbanLaneFrame
      ref={setNodeRef}
      style={sortableStyle}
      isOver={isOver}
      className={className}
      header={header?.(dragHandleProps)}
      footer={footer}
      {...rest}
    >
      {typeof children === 'function' ? children(dragHandleProps) : children}
    </KanbanLaneFrame>
  );
};
