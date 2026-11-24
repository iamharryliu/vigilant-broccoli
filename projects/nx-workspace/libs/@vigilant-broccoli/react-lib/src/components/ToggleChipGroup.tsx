'use client';

import { cn } from '../utils/cn';
import { Button } from './Button';

export type ToggleChipOption<T extends string | number> = {
  value: T;
  label: string;
  // Read by assistive tech when the visible label is abbreviated.
  ariaLabel?: string;
};

const SHAPE_CLASS = {
  circle: 'size-11 rounded-full p-0',
  // Shares the row equally so a fixed set such as weekdays stays on one line.
  oval: 'h-10 min-w-0 flex-1 basis-0 rounded-full p-0',
} as const;

// A circle that fills its grid cell, so `columns` items share each row at any
// container width.
const GRID_CIRCLE_CLASS =
  'aspect-square h-auto w-full min-w-0 rounded-full p-0 text-xs';

export type ToggleChipShape = keyof typeof SHAPE_CLASS;

/**
 * Multi-select group of round toggle buttons (`aria-pressed`), for picking
 * several values such as weekdays or dates. Use `ToggleGroup` for a single
 * choice.
 */
export function ToggleChipGroup<T extends string | number>({
  label,
  options,
  selected,
  onToggle,
  shape = 'circle',
  columns,
  className,
}: {
  label: string;
  options: ToggleChipOption<T>[];
  selected: T[];
  onToggle: (value: T) => void;
  shape?: ToggleChipShape;
  // Lays the chips out in this many equal columns; chips fill their cell.
  columns?: number;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(columns ? 'grid gap-1' : 'flex flex-wrap gap-1', className)}
      style={
        columns
          ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }
          : undefined
      }
    >
      {options.map(option => {
        const isSelected = selected.includes(option.value);
        return (
          <Button
            key={option.value}
            size="sm"
            variant={isSelected ? 'default' : 'outline'}
            aria-pressed={isSelected}
            aria-label={option.ariaLabel}
            className={columns ? GRID_CIRCLE_CLASS : SHAPE_CLASS[shape]}
            onClick={() => onToggle(option.value)}
          >
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}
