import { GripVertical } from 'lucide-react';
import {
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
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ComponentPropsWithoutRef, ReactNode, useState } from 'react';
import { KanbanAddLaneButton, KanbanLaneFrame } from './KanbanLaneFrame';
import {
  KanbanLaneDragOverlay,
  KanbanLaneHeader,
  KanbanLaneRow,
  KanbanLaneTitle,
} from './KanbanLaneChrome';
import {
  kanbanCollisionDetection,
  KanbanSortableLane,
  useKanbanLaneReorder,
} from './KanbanLaneDnd';
import { cn, Text } from '@vigilant-broccoli/react-lib';

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
  // Shows the dashed "+ Add Lane" button after the last lane.
  onAddLane?: () => void;
  // Trailing header controls, e.g. search or a remove button.
  renderLaneActions?: (lane: KanbanLane) => ReactNode;
  // A row under the header, e.g. a sort select.
  renderLaneToolbar?: (lane: KanbanLane) => ReactNode;
  emptyLaneLabel?: ReactNode;
  // `row` drops the card border and adds a grip handle, matching CheckList rows.
  cardVariant?: KanbanCardVariant;
  className?: string;
};

export type KanbanCardVariant = 'card' | 'row';

const LANE_PREFIX = 'lane:';

const toLaneDropId = (laneId: string) => `${LANE_PREFIX}${laneId}`;

const KanbanSortableCard = ({
  id,
  variant,
  children,
}: {
  id: string;
  variant: KanbanCardVariant;
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
  const isRow = variant === 'row';
  const dragProps = { ...attributes, ...listeners };

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        isRow
          ? 'flex items-start gap-2'
          : 'cursor-grab touch-none rounded border border-gray-200 px-2 py-2 active:cursor-grabbing dark:border-gray-700',
        isDragging && 'opacity-40',
      )}
      {...(isRow ? {} : dragProps)}
    >
      {isRow && (
        <div
          {...dragProps}
          className="cursor-grab touch-none py-2 opacity-50 transition-opacity hover:opacity-100 active:cursor-grabbing"
        >
          <GripVertical size={15} />
        </div>
      )}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
};

const KanbanLaneColumn = ({
  lane,
  cardIds,
  emptyLabel,
  footer,
  actions,
  toolbar,
  reorderable,
  children,
}: {
  lane: KanbanLane;
  actions?: ReactNode;
  toolbar?: ReactNode;
  cardIds: string[];
  emptyLabel: ReactNode;
  footer?: ReactNode;
  reorderable: boolean;
  children: ReactNode;
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: toLaneDropId(lane.id) });

  const renderHeader = (dragHandleProps?: ComponentPropsWithoutRef<'div'>) => (
    <KanbanLaneHeader
      title={<KanbanLaneTitle>{lane.title}</KanbanLaneTitle>}
      dragHandleProps={dragHandleProps}
      actions={actions}
      toolbar={toolbar}
    />
  );

  const body = (
    <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
      <div
        ref={setNodeRef}
        className="-mx-2 flex min-h-16 flex-1 flex-col gap-2 overflow-y-auto px-2"
      >
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

  // Same card as a react-lib-tasks lane, whose `GoogleTasksComponent` wraps its header and list in a `Card`.
  const className =
    'h-full w-80 gap-3 overflow-hidden border border-border bg-card p-4 text-card-foreground';

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
  onAddLane,
  renderLaneFooter,
  renderLaneActions,
  renderLaneToolbar,
  emptyLaneLabel = 'No cards',
  cardVariant = 'card',
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
      collisionDetection={kanbanCollisionDetection}
      onDragStart={handleDragStart}
      onDragOver={laneReorder.onDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <KanbanLaneRow
        laneIds={laneReorder.lanes.map(lane => lane.id)}
        className={className}
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
              actions={renderLaneActions?.(lane)}
              toolbar={renderLaneToolbar?.(lane)}
              reorderable={!!onReorderLanes}
            >
              {laneCards.map(card => (
                <KanbanSortableCard
                  key={card.id}
                  id={card.id}
                  variant={cardVariant}
                >
                  {renderCard(card)}
                </KanbanSortableCard>
              ))}
            </KanbanLaneColumn>
          );
        })}
        {onAddLane && <KanbanAddLaneButton onClick={onAddLane} />}
      </KanbanLaneRow>
      <DragOverlay>
        {activeCard ? (
          <div className="rounded border border-gray-200 bg-white px-2 py-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
            {renderCard(activeCard)}
          </div>
        ) : laneReorder.activeLane ? (
          <KanbanLaneDragOverlay title={laneReorder.activeLane.title} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
