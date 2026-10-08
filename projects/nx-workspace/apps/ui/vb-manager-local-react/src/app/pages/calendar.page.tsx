import { useEffect, useState } from 'react';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@vigilant-broccoli/react-lib';
import { EventCalendarsComponent } from '../components/event-calendars.component';
import { PersonalCalendarComponent } from '../components/personal-calendar.component';
import { SIDEBAR_ROUTE } from '../app.const';
import { usePageTitle } from '../use-page-title';

const TAB = {
  EVENT_CALENDARS: 'event-calendars',
  PERSONAL: 'personal',
} as const;

type Tab = (typeof TAB)[keyof typeof TAB];

const TAB_STORAGE_KEY = 'calendar-page-tab';

const isTab = (value: string | null): value is Tab =>
  Object.values(TAB).includes(value as Tab);

export default function Page() {
  usePageTitle(SIDEBAR_ROUTE.CALENDAR.title);
  const [activeTab, setActiveTab] = useState<Tab>(TAB.EVENT_CALENDARS);

  useEffect(() => {
    const storedTab = localStorage.getItem(TAB_STORAGE_KEY);
    if (isTab(storedTab)) setActiveTab(storedTab);
  }, []);

  const handleTabChange = (value: string) => {
    if (!isTab(value)) return;
    setActiveTab(value);
    localStorage.setItem(TAB_STORAGE_KEY, value);
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className="h-full flex flex-col"
    >
      <TabsList>
        <TabsTrigger value={TAB.EVENT_CALENDARS}>Event Calendars</TabsTrigger>
        <TabsTrigger value={TAB.PERSONAL}>Personal Calendar</TabsTrigger>
      </TabsList>
      <TabsContent
        value={TAB.EVENT_CALENDARS}
        className="pt-4 flex-1 min-h-0 overflow-y-auto"
      >
        <EventCalendarsComponent />
      </TabsContent>
      <TabsContent value={TAB.PERSONAL} className="pt-4 flex-1 min-h-0">
        <PersonalCalendarComponent className="h-full" />
      </TabsContent>
    </Tabs>
  );
}
