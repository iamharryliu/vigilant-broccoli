import { useState } from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@vigilant-broccoli/react-lib';
import {
  CALENDAR_SECTION_STATE,
  TAB,
  TAB_STORAGE_KEY,
} from '../../lib/calendars.consts';
import { CalendarLink } from '../../lib/calendars.types';
import { useTranslation } from '../i18n';
import { CalendarList } from './CalendarList';
import { useEventCalendars } from '../hooks/useEventCalendars';
import { CalendarView } from './CalendarView';
import { EventCalendars } from './EventCalendars';

type Tab = (typeof TAB)[keyof typeof TAB];
const isTab = (value: string | null): value is Tab =>
  Object.values(TAB).includes(value as Tab);

const readStoredTab = (): Tab => {
  try {
    const stored = localStorage.getItem(TAB_STORAGE_KEY);
    if (isTab(stored)) return stored;
  } catch {
    // Storage unavailable: fall back to the default tab.
  }
  return TAB.CALENDAR_VIEW;
};

export const CalendarTabs = ({
  personalCalendars,
}: {
  personalCalendars: CalendarLink[];
}) => {
  const { t } = useTranslation();
  const eventCalendars = useEventCalendars();
  const [activeTab, setActiveTab] = useState<Tab>(readStoredTab);

  const handleTabChange = (value: string) => {
    if (!isTab(value)) return;
    setActiveTab(value);
    try {
      localStorage.setItem(TAB_STORAGE_KEY, value);
    } catch {
      // Storage unavailable: the tab just isn't remembered.
    }
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className="flex flex-col gap-4"
    >
      <TabsList>
        <TabsTrigger value={TAB.CALENDAR_VIEW}>
          {t('SECTION.CALENDAR_VIEW')}
        </TabsTrigger>
        <TabsTrigger value={TAB.PERSONAL}>{t('SECTION.PERSONAL')}</TabsTrigger>
        <TabsTrigger value={TAB.EVENT_CALENDARS}>
          {t('SECTION.EVENT')}
        </TabsTrigger>
      </TabsList>
      {/* Force-mounted so switching tabs doesn't reload the iframe. */}
      <TabsContent
        forceMount
        value={TAB.CALENDAR_VIEW}
        className="mt-0"
        style={{
          display: activeTab === TAB.CALENDAR_VIEW ? undefined : 'none',
        }}
        aria-hidden={activeTab !== TAB.CALENDAR_VIEW}
      >
        {eventCalendars.state !== CALENDAR_SECTION_STATE.LOADING && (
          <CalendarView
            eventCalendars={eventCalendars.embedCalendars}
            hiddenIds={eventCalendars.hiddenIds}
          />
        )}
      </TabsContent>
      <TabsContent value={TAB.PERSONAL} className="mt-0">
        <CalendarList calendars={personalCalendars} />
      </TabsContent>
      <TabsContent value={TAB.EVENT_CALENDARS} className="mt-0">
        <EventCalendars
          state={eventCalendars.state}
          calendars={eventCalendars.calendars}
          hiddenIds={eventCalendars.hiddenIds}
          onToggleHidden={eventCalendars.toggleHidden}
        />
      </TabsContent>
    </Tabs>
  );
};
