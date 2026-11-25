import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { ComponentPropsWithoutRef, ReactNode, useState } from 'react';
import { cn } from '../utils/cn';
import { KanbanLaneFrame } from './KanbanLaneFrame';
import { KanbanSortableLane, useKanbanLaneReorder } from './KanbanLaneDnd';
import { Text } from './Text';

export type KanbanCard = {
  id: string;
  laneId: string;
};

export type KanbanLane = {
  id: string;
  title: ReactNode;
};

export type KanbanMove = {
  cardId: string;
  fromLaneId: string;
  toLaneId: string;
  toIndex: number;
};

type KanbanBoardProps<TCard extends KanbanCard> = {
  lanes: KanbanLane[];
  cards: TCard[];
  renderCard: (card: TCard) => ReactNode;
  onMoveCard: (move: KanbanMove) => void;
  // Opts lanes into drag reordering; receives the new lane id order.
  onReorderLanes?: (laneIds: string[]) => void;
  renderLaneFooter?: (lane: KanbanLane) => ReactNode;
  emptyLaneLabel?: ReactNode;
  className?: string;
};

const LANE_PREFIX = 'lane:';

const toLaneDropId = (laneId: string) => `${LANE_PREFIX}${laneId}`;

const KanbanSortableCard = ({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'cursor-grab touch-none rounded-md border border-gray-200 bg-white p-3 shadow-sm active:cursor-grabbing dark:border-gray-700 dark:bg-gray-800',
        isDragging && 'opacity-40',
      )}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
};

const KanbanLaneColumn = ({
  lane,
  cardIds,
  emptyLabel,
  footer,
  reorderable,
  children,
}: {
  lane: KanbanLane;
  cardIds: string[];
  emptyLabel: ReactNode;
  footer?: ReactNode;
  reorderable: boolean;
  children: ReactNode;
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: toLaneDropId(lane.id) });

  const renderHeader = (dragHandleProps?: ComponentPropsWithoutRef<'div'>) => (
    <header className="flex items-center justify-between gap-2">
      <div
        {...dragHandleProps}
        className={cn(
          'flex flex-1 items-center gap-1',
          dragHandleProps && 'cursor-grab touch-none active:cursor-grabbing',
        )}
      >
        {dragHandleProps && (
          <GripVertical size={15} className="opacity-40 hover:opacity-70" />
        )}
        <Text size="2" weight="bold">
          {lane.title}
        </Text>
      </div>
      <Text size="1" color="gray">
        {cardIds.length}
      </Text>
    </header>
  );

  const body = (
    <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
      <div ref={setNodeRef} className="flex min-h-16 flex-col gap-2">
        {cardIds.length === 0 ? (
          <div className="rounded-md border border-dashed border-gray-300 p-3 text-center dark:border-gray-600">
            <Text size="1" color="gray">
              {emptyLabel}
            </Text>
          </div>
        ) : (
          children
        )}
      </div>
    </SortableContext>
  );

  const className = 'w-72 gap-3 bg-gray-100 p-3 dark:bg-gray-900';

  return reorderable ? (
    <KanbanSortableLane
      lane={lane}
      isOver={isOver}
      className={className}
      header={renderHeader}
      footer={footer}
    >
      {body}
    </KanbanSortableLane>
  ) : (
    <KanbanLaneFrame
      isOver={isOver}
      className={className}
      header={renderHeader()}
      footer={footer}
    >
      {body}
    </KanbanLaneFrame>
  );
};

export const KanbanBoard = <TCard extends KanbanCard>({
  lanes,
  cards,
  renderCard,
  onMoveCard,
  onReorderLanes,
  renderLaneFooter,
  emptyLaneLabel = 'No cards',
  className,
}: KanbanBoardProps<TCard>) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const laneReorder = useKanbanLaneReorder({
    lanes,
    onReorder: reordered => onReorderLanes?.(reordered.map(lane => lane.id)),
    resolveOverLaneId: over => {
      const overId = String(over.id);
      if (overId.startsWith(LANE_PREFIX))
        return overId.slice(LANE_PREFIX.length);
      return (
        lanes.find(lane => lane.id === overId)?.id ??
        cards.find(card => card.id === overId)?.laneId
      );
    },
  });

  const cardsByLane = (laneId: string) =>
    cards.filter(card => card.laneId === laneId);
  const activeCard = cards.find(card => card.id === activeId);

  // `over` is a lane droppable or lane (empty area, appends) or another card.
  const resolveTarget = (overId: string) => {
    const laneId = overId.startsWith(LANE_PREFIX)
      ? overId.slice(LANE_PREFIX.length)
      : lanes.find(lane => lane.id === overId)?.id;
    if (laneId) return { laneId, index: cardsByLane(laneId).length };
    const overCard = cards.find(card => card.id === overId);
    if (!overCard) return null;
    return {
      laneId: overCard.laneId,
      index: cardsByLane(overCard.laneId).findIndex(c => c.id === overId),
    };
  };

  const handleDragStart = (event: DragStartEvent) => {
    if (laneReorder.onDragStart(event)) return;
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (laneReorder.onDragEnd(event)) return;
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;
    const card = cards.find(c => c.id === active.id);
    const target = resolveTarget(String(over.id));
    if (!card || !target) return;
    const fromIndex = cardsByLane(card.laneId).findIndex(c => c.id === card.id);
    if (card.laneId === target.laneId && fromIndex === target.index) return;
    onMoveCard({
      cardId: card.id,
      fromLaneId: card.laneId,
      toLaneId: target.laneId,
      toIndex: target.index,
    });
  };

  const handleDragCancel = () => {
    laneReorder.onDragCancel();
    setActiveId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={laneReorder.onDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext
        items={laneReorder.lanes.map(lane => lane.id)}
        strategy={horizontalListSortingStrategy}
      >
        <div
          className={cn(
            'flex items-start gap-4 overflow-x-auto pb-2',
            className,
          )}
        >
          {laneReorder.lanes.map(lane => {
            const laneCards = cardsByLane(lane.id);
            return (
              <KanbanLaneColumn
                key={lane.id}
                lane={lane}
                cardIds={laneCards.map(card => card.id)}
                emptyLabel={emptyLaneLabel}
                footer={renderLaneFooter?.(lane)}
                reorderable={!!onReorderLanes}
              >
                {laneCards.map(card => (
                  <KanbanSortableCard key={card.id} id={card.id}>
                    {renderCard(card)}
                  </KanbanSortableCard>
                ))}
              </KanbanLaneColumn>
            );
          })}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeCard ? (
          <div className="rounded-md border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800">
            {renderCard(activeCard)}
          </div>
        ) : laneReorder.activeLane ? (
          <div className="w-72 rotate-1 rounded-lg border border-gray-200 bg-gray-100 p-3 shadow-xl dark:border-gray-700 dark:bg-gray-900">
            <Text size="2" weight="bold">
              {laneReorder.activeLane.title}
            </Text>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
