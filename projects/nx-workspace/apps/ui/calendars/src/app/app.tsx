import { PERSONAL_CALENDARS } from '../lib/calendars.consts';
import { buildGoogleCalendarUrl } from '../lib/calendar-links';
import { CalendarSection } from './components/CalendarSection';
import { EventCalendars } from './components/EventCalendars';
import { PageHeader } from './components/PageHeader';
import { PERSONAL_HEADING_ID } from './components/section-ids';
import { I18nProvider } from './i18n';

const personalCalendars = PERSONAL_CALENDARS.map(
  ({ id, name, googleCalendarId }) => ({
    id,
    name,
    url: buildGoogleCalendarUrl(googleCalendarId),
  }),
);

export const App = () => (
  <I18nProvider>
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8 text-gray-900 dark:text-gray-100">
      <PageHeader />
      <CalendarSection
        headingKey="SECTION.PERSONAL"
        headingId={PERSONAL_HEADING_ID}
        calendars={personalCalendars}
      />
      <EventCalendars />
    </main>
  </I18nProvider>
);

export default App;
