'use client';

const SKELETON_GROUP_COUNT = 3;
const SKELETON_ROW_WIDTHS = ['w-2/3', 'w-1/2', 'w-3/4'] as const;

function SkeletonBlock({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-muted ${className}`}
      aria-hidden="true"
    />
  );
}

function SkeletonRow({ widthClassName }: { widthClassName: string }) {
  return (
    <div className="flex w-full items-center gap-3 px-2 py-2">
      <SkeletonBlock className="h-2.5 w-2.5 shrink-0 rounded-full" />
      <SkeletonBlock className="h-3 w-20 shrink-0" />
      <SkeletonBlock className={`h-4 ${widthClassName}`} />
    </div>
  );
}

export function CalendarListSkeleton() {
  return (
    <div
      className="flex w-full flex-col gap-4"
      aria-busy="true"
      aria-label="Loading events"
    >
      {Array.from({ length: SKELETON_GROUP_COUNT }).map((_, groupIndex) => (
        <div key={groupIndex} className="flex flex-col gap-1">
          <SkeletonBlock className="h-4 w-28" />
          <div className="flex flex-col">
            {SKELETON_ROW_WIDTHS.map((widthClassName, rowIndex) => (
              <SkeletonRow key={rowIndex} widthClassName={widthClassName} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
