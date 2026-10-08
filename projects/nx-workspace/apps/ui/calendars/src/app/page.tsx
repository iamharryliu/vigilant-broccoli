import { Suspense } from 'react';
import {
  CALENDAR_SECTION_STATE,
  PERSONAL_CALENDARS,
} from '../lib/calendars.consts';
import { buildGoogleCalendarUrl } from '../lib/calendar-links';
import { EventCalendars } from './components/EventCalendars';
import { PageHeader } from './components/PageHeader';
import { CalendarSection } from './components/CalendarSection';
import {
  EVENT_HEADING_ID,
  PERSONAL_HEADING_ID,
} from './components/section-ids';
import { I18nProvider } from './i18n';

export const dynamic = 'force-dynamic';

const personalCalendars = PERSONAL_CALENDARS.map(
  ({ id, name, googleCalendarId }) => ({
    id,
    name,
    url: buildGoogleCalendarUrl(googleCalendarId),
  }),
);

export default function Page() {
  return (
    <I18nProvider>
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8 text-gray-900 dark:text-gray-100">
        <PageHeader />
        <CalendarSection
          headingKey="SECTION.PERSONAL"
          headingId={PERSONAL_HEADING_ID}
          calendars={personalCalendars}
        />
        <Suspense
          fallback={
            <CalendarSection
              headingKey="SECTION.EVENT"
              headingId={EVENT_HEADING_ID}
              state={CALENDAR_SECTION_STATE.LOADING}
            />
          }
        >
          <EventCalendars />
        </Suspense>
      </main>
    </I18nProvider>
  );
}
