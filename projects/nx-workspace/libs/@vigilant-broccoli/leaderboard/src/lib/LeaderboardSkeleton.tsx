'use client';

import { ComponentType, ReactNode } from 'react';
import { LeaderboardCellSkeleton } from './Skeleton';
import { DisplaySize } from './leaderboard.types';

type MetricAlignment = 'center' | 'end';

interface SkeletonSizeConfig {
  avatarSize: string;
  nameHeight: string;
  nameWidth: string;
  labelHeight: string;
  valueHeight: string;
}

const SKELETON_SIZE_CONFIG: Record<DisplaySize, SkeletonSizeConfig> = {
  default: {
    avatarSize: 'h-12 w-12',
    nameHeight: 'h-6',
    nameWidth: 'w-32',
    labelHeight: 'h-4',
    valueHeight: 'h-5',
  },
  large: {
    avatarSize: 'h-16 w-16',
    nameHeight: 'h-7',
    nameWidth: 'w-40',
    labelHeight: 'h-4',
    valueHeight: 'h-6',
  },
  xl: {
    avatarSize: 'h-20 w-20',
    nameHeight: 'h-8',
    nameWidth: 'w-48',
    labelHeight: 'h-5',
    valueHeight: 'h-7',
  },
  '2xl': {
    avatarSize: 'h-24 w-24',
    nameHeight: 'h-10',
    nameWidth: 'w-56',
    labelHeight: 'h-6',
    valueHeight: 'h-8',
  },
};

const METRIC_WIDTHS = ['w-12', 'w-10', 'w-16', 'w-8', 'w-14', 'w-11'] as const;

function SmartLeaderboardRowSkeleton({
  columnCount,
  className = '',
  isAlternate = false,
  displaySize = 'default',
  metricAlignment = 'center',
  metricsClassName = '',
  nameWidthClassName,
  SkeletonComponent = LeaderboardCellSkeleton,
}: {
  columnCount: number;
  className?: string;
  isAlternate?: boolean;
  displaySize?: DisplaySize;
  metricAlignment?: MetricAlignment;
  metricsClassName?: string;
  nameWidthClassName?: string;
  SkeletonComponent?: ComponentType<{ className?: string }>;
}) {
  const sizeConfig = SKELETON_SIZE_CONFIG[displaySize];
  const columnTotal = Math.max(1, columnCount);
  const metricItemAlignment =
    metricAlignment === 'end'
      ? 'items-end text-right'
      : 'items-center text-center';

  return (
    <div
      className={`flex flex-row items-center p-2 gap-3 rounded-2xl ${isAlternate ? 'bg-muted/50' : ''} ${className}`}
    >
      <div className="flex-shrink-0 flex items-center justify-center">
        <SkeletonComponent className="h-6 w-8 md:w-10 lg:w-12" />
      </div>

      <div className="flex flex-row items-center gap-2 flex-1 min-w-0">
        <SkeletonComponent
          className={`${sizeConfig.avatarSize} rounded-full`}
        />

        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="min-w-0 w-56 shrink-0">
            <SkeletonComponent
              className={`${sizeConfig.nameHeight} ${nameWidthClassName ?? sizeConfig.nameWidth}`}
            />
          </div>
          <div className="ml-2 flex-1 min-w-0">
            <div
              className={`grid w-full min-w-0 gap-x-1 gap-y-0 ${metricsClassName}`}
              style={{
                gridTemplateColumns: `repeat(${columnTotal}, minmax(0, 1fr))`,
              }}
            >
              {Array.from({ length: columnTotal }).map((_, index) => (
                <div
                  key={index}
                  className={`flex flex-col gap-1 ${metricItemAlignment}`}
                >
                  <SkeletonComponent
                    className={`${sizeConfig.labelHeight} ${METRIC_WIDTHS[index % METRIC_WIDTHS.length]}`}
                  />
                  <SkeletonComponent
                    className={`${sizeConfig.valueHeight} ${METRIC_WIDTHS[(index + 2) % METRIC_WIDTHS.length]}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaginationSkeleton({
  SkeletonComponent = LeaderboardCellSkeleton,
}: {
  SkeletonComponent?: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex justify-center items-center gap-2">
      <SkeletonComponent className="h-8 w-20 rounded-lg" />
      <div className="flex gap-1">
        <SkeletonComponent className="h-8 w-8 rounded-lg" />
        <SkeletonComponent className="h-8 w-8 rounded-lg" />
        <SkeletonComponent className="h-8 w-8 rounded-lg" />
      </div>
      <SkeletonComponent className="h-8 w-20 rounded-lg" />
    </div>
  );
}

export function LeaderboardSkeleton({
  columnCount,
  rowCount = 5,
  filters,
  header,
  displaySize = 'default',
  showPagination = false,
  containerClassName = 'w-full',
  rowClassName,
  metricsClassName,
  metricAlignment = 'center',
  nameWidthClassName,
  SkeletonComponent,
}: {
  columnCount: number;
  rowCount?: number;
  filters?: ReactNode;
  header?: ReactNode;
  displaySize?: DisplaySize;
  showPagination?: boolean;
  containerClassName?: string;
  rowClassName?: string;
  metricsClassName?: string;
  metricAlignment?: MetricAlignment;
  nameWidthClassName?: string;
  SkeletonComponent?: ComponentType<{ className?: string }>;
}) {
  return (
    <div className={containerClassName}>
      {header}
      {filters}

      <div className="flex flex-col gap-1">
        {Array.from({ length: rowCount }).map((_, index) => (
          <SmartLeaderboardRowSkeleton
            key={index}
            columnCount={columnCount}
            isAlternate={index % 2 === 1}
            displaySize={displaySize}
            className={rowClassName}
            metricsClassName={metricsClassName}
            metricAlignment={metricAlignment}
            nameWidthClassName={nameWidthClassName}
            SkeletonComponent={SkeletonComponent}
          />
        ))}
      </div>

      {showPagination ? (
        <PaginationSkeleton SkeletonComponent={SkeletonComponent} />
      ) : null}
    </div>
  );
}
