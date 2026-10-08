'use client';

import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { cva, type VariantProps } from 'class-variance-authority';
import { Check } from 'lucide-react';
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
} from 'react';
import { usePortalTheme } from '../hooks/usePortalTheme';
import { cn } from '../utils/cn';

const itemVariants = cva(
  'relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
  {
    variants: {
      color: {
        red: 'text-red-600 dark:text-red-400 data-[highlighted]:text-red-600 dark:data-[highlighted]:text-red-400',
        green:
          'text-green-600 dark:text-green-400 data-[highlighted]:text-green-600 dark:data-[highlighted]:text-green-400',
        blue: 'text-blue-600 dark:text-blue-400 data-[highlighted]:text-blue-600 dark:data-[highlighted]:text-blue-400',
        gray: 'text-muted-foreground data-[highlighted]:text-muted-foreground dark:data-[highlighted]:text-muted-foreground',
        amber:
          'text-amber-600 dark:text-amber-400 data-[highlighted]:text-amber-600 dark:data-[highlighted]:text-amber-400',
      },
    },
  },
);

const Root = DropdownMenuPrimitive.Root;

const Trigger = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Trigger>
>(({ asChild = true, ...props }, ref) => (
  <DropdownMenuPrimitive.Trigger ref={ref} asChild={asChild} {...props} />
));
Trigger.displayName = 'DropdownMenu.Trigger';

const Content = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> & {
    size?: '1' | '2';
  }
>(({ className, style, sideOffset = 4, size = '2', ...props }, ref) => {
  const theme = usePortalTheme();
  return (
    <>
      <span hidden ref={theme.anchorRef} />
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          ref={ref}
          sideOffset={sideOffset}
          className={cn(
            'z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] overflow-y-auto rounded-md border border-border bg-background p-1 text-foreground shadow-md',
            theme.className,
            size === '1' &&
              '[&_[role=menuitem]]:text-xs [&_[role=menuitemradio]]:text-xs',
            className,
          )}
          style={{ ...theme.style, ...style }}
          {...props}
        />
      </DropdownMenuPrimitive.Portal>
    </>
  );
});
Content.displayName = 'DropdownMenu.Content';

const Item = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.Item>,
  Omit<ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>, 'color'> &
    VariantProps<typeof itemVariants>
>(({ className, color, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(itemVariants({ color }), className)}
    {...props}
  />
));
Item.displayName = 'DropdownMenu.Item';

const RadioItem = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(itemVariants(), 'pl-8', className)}
    {...props}
  >
    <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
));
RadioItem.displayName = 'DropdownMenu.RadioItem';

const Separator = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.Separator>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-border', className)}
    {...props}
  />
));
Separator.displayName = 'DropdownMenu.Separator';

export const DropdownMenu = {
  Root,
  Trigger,
  Content,
  Item,
  RadioGroup: DropdownMenuPrimitive.RadioGroup,
  RadioItem,
  Separator,
};
