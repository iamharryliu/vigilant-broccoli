'use client';

import { EventCalendarsComponent } from '../../components/event-calendars.component';
import { SIDEBAR_ROUTE } from '../../app.const';
import { usePageTitle } from '../../use-page-title';

export default function Page() {
  usePageTitle(SIDEBAR_ROUTE.EVENT_CALENDARS.title);
  return <EventCalendarsComponent />;
}
