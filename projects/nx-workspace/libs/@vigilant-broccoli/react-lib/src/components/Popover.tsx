'use client';

import * as PopoverPrimitive from '@radix-ui/react-popover';
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
} from 'react';
import { cn } from '../utils/cn';
import { usePortalTheme } from '../hooks/usePortalTheme';

const Trigger = forwardRef<
  ElementRef<typeof PopoverPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger>
>(({ asChild = true, ...props }, ref) => (
  <PopoverPrimitive.Trigger ref={ref} asChild={asChild} {...props} />
));
Trigger.displayName = 'Popover.Trigger';

const Content = forwardRef<
  ElementRef<typeof PopoverPrimitive.Content>,
  ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, style, sideOffset = 4, ...props }, ref) => {
  const theme = usePortalTheme();
  return (
    <>
      <span hidden ref={theme.anchorRef} />
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          ref={ref}
          sideOffset={sideOffset}
          className={cn(
            'z-50 max-h-[var(--radix-popover-content-available-height)] max-w-[calc(100vw-2rem)] overflow-y-auto rounded-md border border-border bg-background p-4 text-foreground shadow-md outline-none',
            theme.className,
            className,
          )}
          style={{ ...theme.style, ...style }}
          {...props}
        />
      </PopoverPrimitive.Portal>
    </>
  );
});
Content.displayName = 'Popover.Content';

export const Popover = {
  Root: PopoverPrimitive.Root,
  Trigger,
  Content,
  Close: PopoverPrimitive.Close,
  Anchor: PopoverPrimitive.Anchor,
};
