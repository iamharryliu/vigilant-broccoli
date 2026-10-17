import { useEffect, useState } from 'react';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@vigilant-broccoli/react-lib';
import { PersonalCalendarComponent } from './personal-calendar.component';
import { EventCalendarsComponent } from './event-calendars.component';
import { useTranslation } from '../i18n';

// Retain the former calendar page's saved tab preference.
const TAB_STORAGE_KEY = 'calendar-page-tab';
const TAB = {
  CALENDAR_VIEW: 'personal',
  EVENT_CALENDARS: 'event-calendars',
} as const;
type Tab = (typeof TAB)[keyof typeof TAB];
const isTab = (value: string | null): value is Tab =>
  Object.values(TAB).includes(value as Tab);

export const HomeCalendarTabs = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>(TAB.CALENDAR_VIEW);

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
      className="h-full min-h-0 flex flex-col gap-4"
    >
      <TabsList className="shrink-0">
        <TabsTrigger value={TAB.CALENDAR_VIEW}>
          {t('HOME.CALENDAR_VIEW')}
        </TabsTrigger>
        <TabsTrigger value={TAB.EVENT_CALENDARS}>
          {t('HOME.EVENT_CALENDARS')}
        </TabsTrigger>
      </TabsList>
      <TabsContent
        forceMount
        value={TAB.CALENDAR_VIEW}
        className="mt-0 flex-1 min-h-0 border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden"
        style={{
          display: activeTab === TAB.CALENDAR_VIEW ? undefined : 'none',
        }}
        aria-hidden={activeTab !== TAB.CALENDAR_VIEW}
      >
        <PersonalCalendarComponent mode="AGENDA" className="h-full" />
      </TabsContent>
      <TabsContent
        value={TAB.EVENT_CALENDARS}
        className="mt-0 flex-1 min-h-0 overflow-y-auto"
      >
        <EventCalendarsComponent />
      </TabsContent>
    </Tabs>
  );
};
