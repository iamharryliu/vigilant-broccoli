'use client';

import * as TabsPrimitive from '@radix-ui/react-tabs';
import { ComponentPropsWithoutRef, ElementRef, forwardRef } from 'react';
import { useActiveIndicator } from '../hooks/useActiveIndicator';
import { cn } from '../utils/cn';
import {
  TOGGLE_ITEM_CLASS,
  TOGGLE_TRACK_CLASS,
  ToggleIndicator,
} from './ToggleGroup';

const Tabs = TabsPrimitive.Root;

const TabsList = forwardRef<
  ElementRef<typeof TabsPrimitive.List>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, children, ...props }, forwardedRef) => {
  const { ref, indicatorStyle, isAnimated } = useActiveIndicator(forwardedRef);

  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        'inline-flex h-8 w-fit items-center justify-center',
        TOGGLE_TRACK_CLASS,
        className,
      )}
      {...props}
    >
      {/* The trigger is 1px shorter than the track's content box. */}
      <ToggleIndicator
        style={indicatorStyle}
        isAnimated={isAnimated}
        className="h-[calc(100%-7px)]"
      />
      {children}
    </TabsPrimitive.List>
  );
});
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = forwardRef<
  ElementRef<typeof TabsPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      TOGGLE_ITEM_CLASS,
      'h-[calc(100%-1px)] flex-1 px-1.5 py-0.5',
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = forwardRef<
  ElementRef<typeof TabsPrimitive.Content>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
