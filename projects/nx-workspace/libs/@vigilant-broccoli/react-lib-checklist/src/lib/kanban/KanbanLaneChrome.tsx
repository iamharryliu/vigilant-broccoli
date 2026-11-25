import {
  horizontalListSortingStrategy,
  SortableContext,
} from '@dnd-kit/sortable';
import { GripVertical } from 'lucide-react';
import { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn, Skeleton, Text } from '@vigilant-broccoli/react-lib';

// The visible parts of a kanban lane, shared by `KanbanBoard` and react-lib-tasks' `KanbanBoards` so both render the same lanes.

type KanbanLaneHeaderProps = {
  title: ReactNode;
  // Makes the title region a drag handle (with a grip) for lane reordering.
  dragHandleProps?: ComponentPropsWithoutRef<'div'>;
  // Trailing controls, e.g. search or a remove button.
  actions?: ReactNode;
  // A row under the title, e.g. a sort select.
  toolbar?: ReactNode;
};

export const KanbanLaneTitle = ({ children }: { children: ReactNode }) => (
  <Text size="5" weight="bold">
    {children}
  </Text>
);

export const KanbanLaneHeader = ({
  title,
  dragHandleProps,
  actions,
  toolbar,
}: KanbanLaneHeaderProps) => (
  <header className="flex flex-col gap-3">
    <div className="flex items-center justify-between gap-2">
      <div
        {...dragHandleProps}
        className={cn(
          'flex min-w-0 flex-1 items-center gap-1',
          dragHandleProps && 'cursor-grab touch-none active:cursor-grabbing',
        )}
      >
        {dragHandleProps && (
          <GripVertical
            size={15}
            className="flex-shrink-0 opacity-40 hover:opacity-70"
          />
        )}
        {title}
      </div>
      <div className="flex items-center gap-1">{actions}</div>
    </div>
    {toolbar}
  </header>
);

export const KanbanLaneRow = ({
  laneIds,
  className,
  children,
}: {
  laneIds: string[];
  className?: string;
  children: ReactNode;
}) => (
  <SortableContext items={laneIds} strategy={horizontalListSortingStrategy}>
    <div className={cn('flex h-full gap-2 overflow-x-auto pb-4', className)}>
      {children}
    </div>
  </SortableContext>
);

const OVERLAY_ROW_COUNT = 3;

export const KanbanLaneDragOverlay = ({ title }: { title: ReactNode }) => (
  <div className="w-80 rotate-1 rounded border border-gray-200 bg-white p-3 shadow-xl dark:border-gray-600 dark:bg-gray-800">
    <div className="flex items-center gap-2">
      <GripVertical size={15} className="flex-shrink-0 opacity-60" />
      <Text size="3" weight="bold">
        {title ? title : <Skeleton className="h-5 w-32" />}
      </Text>
    </div>
    <div className="mt-2 space-y-1.5">
      {Array.from({ length: OVERLAY_ROW_COUNT }).map((_, i) => (
        <div
          key={i}
          className="h-6 rounded bg-gray-100 dark:bg-gray-700"
          style={{ width: `${80 - i * 15}%` }}
        />
      ))}
    </div>
  </div>
);
