'use client';

import * as ContextMenuPrimitive from '@radix-ui/react-context-menu';
import { cva, type VariantProps } from 'class-variance-authority';
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
        gray: 'text-muted-foreground data-[highlighted]:text-muted-foreground dark:data-[highlighted]:text-muted-foreground',
      },
    },
  },
);

const Trigger = forwardRef<
  ElementRef<typeof ContextMenuPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Trigger>
>(({ asChild = true, ...props }, ref) => (
  <ContextMenuPrimitive.Trigger ref={ref} asChild={asChild} {...props} />
));
Trigger.displayName = 'ContextMenu.Trigger';

const Content = forwardRef<
  ElementRef<typeof ContextMenuPrimitive.Content>,
  ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Content>
>(({ className, style, ...props }, ref) => {
  const theme = usePortalTheme();
  return (
    <>
      <span hidden ref={theme.anchorRef} />
      <ContextMenuPrimitive.Portal>
        <ContextMenuPrimitive.Content
          ref={ref}
          className={cn(
            'z-50 max-h-[var(--radix-context-menu-content-available-height)] min-w-[8rem] overflow-y-auto rounded-md border border-border bg-background p-1 text-foreground shadow-md',
            theme.className,
            className,
          )}
          style={{ ...theme.style, ...style }}
          {...props}
        />
      </ContextMenuPrimitive.Portal>
    </>
  );
});
Content.displayName = 'ContextMenu.Content';

const Item = forwardRef<
  ElementRef<typeof ContextMenuPrimitive.Item>,
  Omit<ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item>, 'color'> &
    VariantProps<typeof itemVariants>
>(({ className, color, ...props }, ref) => (
  <ContextMenuPrimitive.Item
    ref={ref}
    className={cn(itemVariants({ color }), className)}
    {...props}
  />
));
Item.displayName = 'ContextMenu.Item';

const Separator = forwardRef<
  ElementRef<typeof ContextMenuPrimitive.Separator>,
  ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-border', className)}
    {...props}
  />
));
Separator.displayName = 'ContextMenu.Separator';

export const ContextMenu = {
  Root: ContextMenuPrimitive.Root,
  Trigger,
  Content,
  Item,
  Separator,
};
