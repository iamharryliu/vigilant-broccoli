'use client';

import {
  createContext,
  CSSProperties,
  KeyboardEvent,
  ReactNode,
  useContext,
} from 'react';
import { useActiveIndicator } from '../hooks/useActiveIndicator';
import { cn } from '../utils/cn';

// Shared look for the track, the sliding pill and each item. Tabs imports these
// too, so the toggle controls stay visually identical.
export const TOGGLE_TRACK_CLASS =
  'relative rounded-lg bg-muted p-[3px] text-muted-foreground';
const TOGGLE_INDICATOR_CLASS =
  'pointer-events-none absolute left-0 top-[3px] h-[calc(100%-6px)] rounded-md bg-background shadow-sm dark:border dark:border-input dark:bg-input/30';
export const TOGGLE_ITEM_CLASS =
  'relative inline-flex items-center justify-center gap-1.5 rounded-md border border-transparent text-sm font-medium whitespace-nowrap text-foreground/60 transition-all cursor-pointer hover:text-foreground focus-visible:border-ring focus-visible:outline-1 focus-visible:outline-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground dark:text-muted-foreground dark:hover:text-foreground dark:data-[state=active]:text-foreground';

export function ToggleIndicator({
  style,
  isAnimated,
  className,
}: {
  style: CSSProperties;
  isAnimated: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        TOGGLE_INDICATOR_CLASS,
        isAnimated &&
          'transition-[transform,width] duration-200 ease-out motion-reduce:transition-none',
        className,
      )}
      style={style}
    />
  );
}

const KEY_STEP: Record<string, number> = {
  ArrowRight: 1,
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowUp: -1,
};

const RADIO_SELECTOR = '[role="radio"]';

type ToggleGroupContextValue = {
  value: string;
  onValueChange: (value: string) => void;
};

const ToggleGroupContext = createContext<ToggleGroupContextValue | null>(null);

// UI-only single-select group: it owns the track, the sliding pill and
// radiogroup keyboard behavior, and renders whatever items it is given.
export function ToggleGroup({
  label,
  value,
  onValueChange,
  className,
  children,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  children: ReactNode;
}) {
  const { ref, indicatorStyle, isAnimated } = useActiveIndicator();

  // Native radiogroup behavior: arrows move focus and select together, and
  // only the selected item is in the tab order.
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const radios = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>(RADIO_SELECTOR),
    );
    const current = radios.findIndex(radio => radio.dataset.value === value);
    let next: number;
    if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = radios.length - 1;
    else if (event.key in KEY_STEP)
      next = (current + KEY_STEP[event.key] + radios.length) % radios.length;
    else return;
    event.preventDefault();
    radios[next]?.focus();
    radios[next]?.click();
  };

  return (
    <ToggleGroupContext.Provider value={{ value, onValueChange }}>
      <div
        ref={ref}
        role="radiogroup"
        aria-label={label}
        onKeyDown={handleKeyDown}
        className={cn('flex w-fit', TOGGLE_TRACK_CLASS, className)}
      >
        <ToggleIndicator style={indicatorStyle} isAnimated={isAnimated} />
        {children}
      </div>
    </ToggleGroupContext.Provider>
  );
}

export function ToggleGroupItem({
  value,
  label,
  className,
  children,
}: {
  value: string;
  // Read by assistive tech; the visible content may be an icon or short label.
  label: string;
  className?: string;
  children: ReactNode;
}) {
  const group = useContext(ToggleGroupContext);
  if (!group) throw new Error('ToggleGroupItem must be used in a ToggleGroup');
  const isActive = group.value === value;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={isActive}
      aria-label={label}
      tabIndex={isActive ? 0 : -1}
      data-state={isActive ? 'active' : 'inactive'}
      data-value={value}
      onClick={() => group.onValueChange(value)}
      className={cn(TOGGLE_ITEM_CLASS, className)}
    >
      {children}
    </button>
  );
}
