'use client';

import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { ComponentProps } from 'react';
import { DayPicker, getDefaultClassNames } from 'react-day-picker';
import { cn } from '../utils/cn';
import { buttonVariants } from './Button';

const HIGHLIGHTED_MODIFIER = 'highlighted';

export type CalendarProps = ComponentProps<typeof DayPicker> & {
  // Marks the days a schedule or event falls on, in the selected-day style,
  // without making the calendar selectable.
  isHighlighted?: (date: Date) => boolean;
};

/**
 * Month calendar styled like shadcn/ui's Calendar: a themed wrapper over
 * react-day-picker that needs no stylesheet import. Accepts every `DayPicker`
 * prop (`mode`, `selected`, `onSelect`, `modifiers`, ...).
 */
export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  isHighlighted,
  modifiers,
  modifiersClassNames,
  components,
  ...props
}: CalendarProps) {
  const defaults = getDefaultClassNames();
  const navButtonClass = cn(
    buttonVariants({ variant: 'ghost' }),
    'size-8 p-0 select-none aria-disabled:opacity-50',
  );
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('w-fit p-2', className)}
      classNames={{
        root: cn('w-fit', defaults.root),
        months: 'relative flex flex-col gap-4 md:flex-row',
        month: 'flex w-full flex-col gap-4',
        nav: 'absolute inset-x-0 top-0 flex w-full items-center justify-between',
        button_previous: navButtonClass,
        button_next: navButtonClass,
        month_caption: 'flex h-8 w-full items-center justify-center px-8',
        caption_label: 'text-sm font-medium select-none',
        month_grid: 'w-full border-collapse',
        weekdays: 'flex',
        weekday:
          'size-8 flex-1 text-[0.8rem] font-normal text-muted-foreground select-none',
        week: 'mt-1 flex w-full',
        // The highlight circle (`before:`) always exists, scaled to zero, so
        // selecting and deselecting a day can transition instead of popping.
        day: 'relative isolate flex h-8 flex-1 items-center justify-center p-0 text-center text-sm transition-colors duration-200 select-none before:absolute before:top-1/2 before:left-1/2 before:-z-10 before:size-8 before:-translate-x-1/2 before:-translate-y-1/2 before:scale-0 before:rounded-full before:bg-primary before:opacity-0 before:transition-all before:duration-200 before:ease-out motion-reduce:transition-none motion-reduce:before:transition-none [&>button]:mx-auto [&>button]:size-8 [&>button]:cursor-pointer [&>button]:rounded-md [&>button]:p-0 [&>button]:font-normal [&>button]:hover:bg-accent [&>button]:hover:text-accent-foreground',
        day_button: 'inline-flex items-center justify-center text-sm',
        selected:
          '[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground',
        today: '[&>button]:border [&>button]:border-ring',
        outside: 'text-muted-foreground opacity-50',
        disabled: 'text-muted-foreground opacity-50',
        hidden: 'invisible',
        ...classNames,
      }}
      modifiers={{
        ...modifiers,
        ...(isHighlighted && { [HIGHLIGHTED_MODIFIER]: isHighlighted }),
      }}
      modifiersClassNames={{
        // A circle behind the day number, drawn on the cell because a
        // display-only calendar (no `mode`) renders no day button to style.
        [HIGHLIGHTED_MODIFIER]:
          'font-medium text-primary-foreground before:scale-100 before:opacity-100 [&>button]:text-primary-foreground',
        ...modifiersClassNames,
      }}
      components={{
        Chevron: ({ className: chevronClass, orientation, ...rest }) => {
          const Icon =
            orientation === 'left'
              ? ChevronLeft
              : orientation === 'right'
                ? ChevronRight
                : ChevronDown;
          return <Icon className={cn('size-4', chevronClass)} {...rest} />;
        },
        ...components,
      }}
      {...props}
    />
  );
}
