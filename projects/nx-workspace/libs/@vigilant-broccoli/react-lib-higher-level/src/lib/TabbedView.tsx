'use client';

import { ReactNode } from 'react';
import {
  cn,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@vigilant-broccoli/react-lib';

// px-2 keeps seven 36px-wide, 44px-tall triggers plus the actions button
// inside a 360px phone without horizontal overflow; px-3 needs about 34px more.
const TAB_TOUCH_CLASS = 'px-2';
// Inactive force-mounted panels stay laid out at the active panel's size
// (top-14 = the h-11 tab row plus gap-3) instead of display:none. A frame
// that renders inside a display:none panel lays out at zero width, and WebKit
// keeps the resulting tall grid row heights after the panel is shown, leaving
// blank gaps between task rows and weather tiles in the embeds.
const INACTIVE_FORCE_MOUNTED_CLASS =
  'invisible absolute inset-x-0 bottom-0 top-14 overflow-hidden';

export interface TabbedViewTab<T extends string> {
  value: T;
  label: string;
  icon: ReactNode;
  content: ReactNode;
  // Keeps the content mounted (hidden) while inactive, e.g. to avoid
  // reloading an iframe.
  forceMount?: boolean;
}

interface TabbedViewProps<T extends string> {
  tabs: TabbedViewTab<T>[];
  value: T;
  onValueChange: (value: T) => void;
  actions?: ReactNode;
}

export const TabbedView = <T extends string>({
  tabs,
  value,
  onValueChange,
  actions,
}: TabbedViewProps<T>) => (
  <Tabs
    value={value}
    onValueChange={next => onValueChange(next as T)}
    className="relative flex h-full min-h-0 w-full flex-col gap-3"
  >
    <div className="flex shrink-0 items-center justify-between gap-2">
      <TabsList className="h-11">
        {tabs.map(tab => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            aria-label={tab.label}
            title={tab.label}
            className={TAB_TOUCH_CLASS}
          >
            {tab.icon}
          </TabsTrigger>
        ))}
      </TabsList>
      {actions}
    </div>

    {tabs.map(tab =>
      tab.forceMount ? (
        <TabsContent
          key={tab.value}
          forceMount
          value={tab.value}
          className={cn(
            'mt-0 flex min-h-0 flex-1 flex-col',
            value !== tab.value && INACTIVE_FORCE_MOUNTED_CLASS,
          )}
          aria-hidden={value !== tab.value}
        >
          {tab.content}
        </TabsContent>
      ) : (
        <TabsContent
          key={tab.value}
          value={tab.value}
          className="mt-0 min-h-0 flex-1 overflow-y-auto pb-[env(safe-area-inset-bottom)]"
        >
          {tab.content}
        </TabsContent>
      ),
    )}
  </Tabs>
);
