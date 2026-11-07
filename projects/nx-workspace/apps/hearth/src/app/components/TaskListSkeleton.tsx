import { Skeleton } from '@vigilant-broccoli/react-lib';

const SKELETON_ROWS = [
  { title: 'w-2/3', badge: true },
  { title: 'w-1/2', badge: false },
  { title: 'w-3/4', badge: true },
  { title: 'w-2/5', badge: false },
] as const;

export function TaskListSkeleton() {
  return (
    <div className="flex flex-col" aria-busy="true" aria-label="Loading tasks">
      {SKELETON_ROWS.map(({ title, badge }, index) => (
        <div
          key={index}
          className="flex items-center gap-3 border-b border-[var(--gray-a4)] py-1.5 last:border-b-0"
        >
          <Skeleton className="h-5 w-5 shrink-0 rounded-sm" />
          <div className="flex flex-1 items-center gap-3">
            <div className="flex-1">
              <Skeleton className={`h-5 ${title}`} />
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {badge && <Skeleton className="h-5 w-16 rounded-full" />}
              <Skeleton className="h-9 w-9 rounded-md" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
