import { ReactNode } from 'react';
import { cn } from '../utils/cn';

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

const ROOT_CLASS =
  'flex w-fit rounded-lg border border-gray-200 bg-white p-0.5 dark:border-gray-700 dark:bg-gray-800';
const ITEM_CLASS =
  'flex items-center whitespace-nowrap rounded-md transition cursor-pointer';
const ITEM_ACTIVE_CLASS =
  'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900';
const ITEM_INACTIVE_CLASS =
  'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100';

export function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
  size = 'md',
  className,
}: {
  label: string;
  value: T;
  options: SegmentedControlOption<T>[];
  onChange: (value: T) => void;
  size?: SegmentedControlSize;
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(ROOT_CLASS, className)}
    >
      {options.map(option => {
        const isActive = option.value === value;
        // The visible label is dropped on mobile once an icon or short label
        // stands in for it, so aria-label carries the full name regardless.
        const isLabelResponsive = Boolean(option.icon || option.shortLabel);
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={option.label}
            onClick={() => onChange(option.value)}
            className={cn(
              ITEM_CLASS,
              SIZE_CLASS[size],
              isActive ? ITEM_ACTIVE_CLASS : ITEM_INACTIVE_CLASS,
            )}
          >
            {option.icon}
            {option.shortLabel && (
              <span className="sm:hidden">{option.shortLabel}</span>
            )}
            <span className={cn(isLabelResponsive && 'hidden sm:inline')}>
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
