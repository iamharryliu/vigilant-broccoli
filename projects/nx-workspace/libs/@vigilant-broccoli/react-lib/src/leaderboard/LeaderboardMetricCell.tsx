import { ReactNode } from 'react';
import { MetricCell } from './MetricCell';
import { cn } from '../utils/cn';

export function LeaderboardMetricCell({
  label,
  value,
  className,
  labelClassName,
  valueClassName,
  isChanging = false,
  valueSizeClass = 'text-sm',
}: {
  label: ReactNode;
  value: ReactNode;
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
  isChanging?: boolean;
  valueSizeClass?: string;
}) {
  return (
    <MetricCell
      label={String(label)}
      value={value}
      className={className}
      labelClassName={cn(
        'text-xs text-muted-foreground whitespace-nowrap transition-all duration-300',
        labelClassName,
      )}
      valueClassName={cn(
        `${valueSizeClass} font-bold text-foreground tabular-nums transition-all duration-300`,
        isChanging && 'scale-110 text-blue-500',
        valueClassName,
      )}
    />
  );
}
