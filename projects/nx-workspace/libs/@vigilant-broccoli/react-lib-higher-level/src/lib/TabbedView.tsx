'use client';

import { ReactNode } from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@vigilant-broccoli/react-lib';

// px-3 keeps six 44px-wide triggers plus the actions button inside a 360px
// phone without horizontal overflow.
const TAB_TOUCH_CLASS = 'px-3';

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
    className="flex h-full w-full flex-col gap-3"
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
          className="mt-0 flex min-h-0 flex-1 flex-col"
          style={{ display: value === tab.value ? undefined : 'none' }}
          aria-hidden={value !== tab.value}
        >
          {tab.content}
        </TabsContent>
      ) : (
        <TabsContent key={tab.value} value={tab.value} className="mt-0">
          {tab.content}
        </TabsContent>
      ),
    )}
  </Tabs>
);
