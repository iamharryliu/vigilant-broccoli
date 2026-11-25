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
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ComponentPropsWithoutRef,
  forwardRef,
  ReactNode,
  useState,
} from 'react';
import { cn } from '../utils/cn';
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
  renderLaneFooter?: (lane: KanbanLane) => ReactNode;
  emptyLaneLabel?: ReactNode;
  className?: string;
};

const LANE_PREFIX = 'lane:';

const toLaneDropId = (laneId: string) => `${LANE_PREFIX}${laneId}`;

type KanbanLaneFrameProps = Omit<
  ComponentPropsWithoutRef<'section'>,
  'title'
> & {
  header: ReactNode;
  footer?: ReactNode;
  isOver?: boolean;
};

export const KanbanLaneFrame = forwardRef<HTMLElement, KanbanLaneFrameProps>(
  ({ header, footer, isOver, className, children, ...rest }, ref) => (
    <section
      ref={ref}
      className={cn(
        'flex shrink-0 flex-col rounded-lg',
        isOver && 'ring-2 ring-blue-400',
        className,
      )}
      {...rest}
    >
      {header}
      {children}
      {footer}
    </section>
  ),
);
KanbanLaneFrame.displayName = 'KanbanLaneFrame';

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
  children,
}: {
  lane: KanbanLane;
  cardIds: string[];
  emptyLabel: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: toLaneDropId(lane.id) });

  return (
    <KanbanLaneFrame
      isOver={isOver}
      className="w-72 gap-3 bg-gray-100 p-3 dark:bg-gray-900"
      header={
        <header className="flex items-center justify-between gap-2">
          <Text size="2" weight="bold">
            {lane.title}
          </Text>
          <Text size="1" color="gray">
            {cardIds.length}
          </Text>
        </header>
      }
      footer={footer}
    >
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
    </KanbanLaneFrame>
  );
};

export const KanbanBoard = <TCard extends KanbanCard>({
  lanes,
  cards,
  renderCard,
  onMoveCard,
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

  const cardsByLane = (laneId: string) =>
    cards.filter(card => card.laneId === laneId);
  const activeCard = cards.find(card => card.id === activeId);

  // `over` is either a lane droppable (empty area) or another card.
  const resolveTarget = (overId: string) => {
    if (overId.startsWith(LANE_PREFIX)) {
      const laneId = overId.slice(LANE_PREFIX.length);
      return { laneId, index: cardsByLane(laneId).length };
    }
    const overCard = cards.find(card => card.id === overId);
    if (!overCard) return null;
    return {
      laneId: overCard.laneId,
      index: cardsByLane(overCard.laneId).findIndex(c => c.id === overId),
    };
  };

  const handleDragStart = ({ active }: DragStartEvent) =>
    setActiveId(String(active.id));

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
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

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div
        className={cn('flex items-start gap-4 overflow-x-auto pb-2', className)}
      >
        {lanes.map(lane => {
          const laneCards = cardsByLane(lane.id);
          return (
            <KanbanLaneColumn
              key={lane.id}
              lane={lane}
              cardIds={laneCards.map(card => card.id)}
              emptyLabel={emptyLaneLabel}
              footer={renderLaneFooter?.(lane)}
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
      <DragOverlay>
        {activeCard ? (
          <div className="rounded-md border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800">
            {renderCard(activeCard)}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
