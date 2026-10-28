'use client';

import { useEffect, useState } from 'react';
import { Bot, CalendarDays, Link2, Rows3, StickyNote } from 'lucide-react';
import {
  QuickLinksPanel,
  TabbedView,
  type TabbedViewTab,
} from '@vigilant-broccoli/react-lib-higher-level';
import { PersonalCalendarComponent } from './personal-calendar.component';
import { EventCalendarsComponent } from './event-calendars.component';
import { NotepadEditorComponent } from './notepad-editor.component';
import { AgenticView } from './agentic-view.component';
import { handleShellExecute } from '../utils/quick-links.utils';
import { QUICK_LINKS } from '../constants/quick-links';
import { useTranslation } from '../i18n';

// Keep the former calendar page's storage key and values for existing browsers.
const TAB_STORAGE_KEY = 'calendar-page-tab';
const TAB_QUERY_PARAM = 'tab';
const TAB = {
  CALENDAR_VIEW: 'personal',
  EVENT_CALENDARS: 'event-calendars',
  NOTEPAD: 'Notepad',
  QUICK_LINKS: 'Quick Links',
  AGENTIC: 'Agentic',
} as const;
type Tab = (typeof TAB)[keyof typeof TAB];
const isTab = (value: string | null): value is Tab =>
  Object.values(TAB).includes(value as Tab);
const TAB_ICON_SIZE = 18;

const replaceTabQueryParam = (value: Tab) => {
  const url = new URL(window.location.href);
  if (value === TAB.CALENDAR_VIEW) url.searchParams.delete(TAB_QUERY_PARAM);
  else url.searchParams.set(TAB_QUERY_PARAM, value);
  window.history.replaceState(
    null,
    '',
    `${url.pathname}${url.search}${url.hash}`,
  );
};

export const HomeCalendarTabs = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>(TAB.CALENDAR_VIEW);

  useEffect(() => {
    const queryTab = new URLSearchParams(window.location.search).get(
      TAB_QUERY_PARAM,
    );
    if (isTab(queryTab)) {
      setActiveTab(queryTab);
      return;
    }
    const storedTab = localStorage.getItem(TAB_STORAGE_KEY);
    if (isTab(storedTab)) {
      setActiveTab(storedTab);
      replaceTabQueryParam(storedTab);
    }
  }, []);

  const handleTabChange = (value: Tab) => {
    setActiveTab(value);
    localStorage.setItem(TAB_STORAGE_KEY, value);
    replaceTabQueryParam(value);
  };

  const tabs: TabbedViewTab<Tab>[] = [
    {
      value: TAB.CALENDAR_VIEW,
      label: t('HOME.CALENDAR_VIEW'),
      icon: <CalendarDays size={TAB_ICON_SIZE} />,
      forceMount: true,
      content: (
        <div className="flex-1 min-h-0 border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
          <PersonalCalendarComponent mode="AGENDA" className="h-full" />
        </div>
      ),
    },
    {
      value: TAB.EVENT_CALENDARS,
      label: t('HOME.EVENT_CALENDARS'),
      icon: <Rows3 size={TAB_ICON_SIZE} />,
      content: <EventCalendarsComponent />,
    },
    {
      value: TAB.NOTEPAD,
      label: t('HOME.NOTEPAD'),
      icon: <StickyNote size={TAB_ICON_SIZE} />,
      forceMount: true,
      content: (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <NotepadEditorComponent style={{ height: '100%', minHeight: 0 }} />
        </div>
      ),
    },
    {
      value: TAB.QUICK_LINKS,
      label: t('HOME.QUICK_LINKS'),
      icon: <Link2 size={TAB_ICON_SIZE} />,
      content: (
        <QuickLinksPanel
          links={QUICK_LINKS}
          onShellExecute={handleShellExecute}
        />
      ),
    },
    {
      value: TAB.AGENTIC,
      label: t('HOME.AGENTIC'),
      icon: <Bot size={TAB_ICON_SIZE} />,
      content: <AgenticView />,
    },
  ];

  return (
    <TabbedView tabs={tabs} value={activeTab} onValueChange={handleTabChange} />
  );
};
