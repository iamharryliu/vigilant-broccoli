'use client';

import { ReactNode } from 'react';

export const MetricCell = ({
  label,
  value,
  labelClassName = 'text-xs text-muted-foreground',
  valueClassName = 'text-sm font-semibold tabular-nums',
  className = '',
}: {
  label: string;
  value: string | number | ReactNode;
  labelClassName?: string;
  valueClassName?: string;
  className?: string;
}) => {
  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <div className={labelClassName}>{label}</div>
      <div className={valueClassName}>{value}</div>
    </div>
  );
};
