'use client';

export const LeaderboardCellSkeleton = ({
  className = '',
}: {
  className?: string;
}) => (
  <div
    className={`animate-pulse bg-muted rounded ${className}`}
    aria-busy="true"
    aria-label="Loading"
  />
);
