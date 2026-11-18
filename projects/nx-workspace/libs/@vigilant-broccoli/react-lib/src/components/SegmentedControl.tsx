'use client';

import { ReactNode } from 'react';
import { cn } from '../utils/cn';
import { ToggleGroup, ToggleGroupItem } from './ToggleGroup';

export type SegmentedControlOption<T extends string> = {
  value: T;
  label: string;
  shortLabel?: string;
  icon?: ReactNode;
};

const SIZE_CLASS = {
  sm: 'gap-1 px-2 py-0.5 text-xs',
  md: 'gap-1.5 px-2 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm',
} as const;

export type SegmentedControlSize = keyof typeof SIZE_CLASS;

const FULL_WIDTH_SIZE_CLASS =
  'gap-2 px-3 py-2.5 text-sm min-h-10 sm:py-2 sm:min-h-0';

export function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
  size = 'md',
  fullWidth = false,
  className,
}: {
  label: string;
  value: T;
  options: SegmentedControlOption<T>[];
  onChange: (value: T) => void;
  size?: SegmentedControlSize;
  // Spans the container with equal-width segments and keeps every label
  // visible beside its icon, which `md` hides below `sm`.
  fullWidth?: boolean;
  className?: string;
}) {
  return (
    <ToggleGroup
      label={label}
      value={value}
      onValueChange={next => onChange(next as T)}
      className={cn(fullWidth && 'w-full', className)}
    >
      {options.map(option => {
        // The visible label is dropped on mobile once an icon or short label
        // stands in for it, so the item's aria-label carries the full name.
        const isLabelResponsive =
          !fullWidth && Boolean(option.icon || option.shortLabel);
        return (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            label={option.label}
            className={cn(
              fullWidth ? FULL_WIDTH_SIZE_CLASS : SIZE_CLASS[size],
              fullWidth && 'flex-1',
            )}
          >
            {option.icon}
            {option.shortLabel && (
              <span className="sm:hidden">{option.shortLabel}</span>
            )}
            <span className={cn(isLabelResponsive && 'hidden sm:inline')}>
              {option.label}
            </span>
          </ToggleGroupItem>
        );
      })}
    </ToggleGroup>
  );
}
