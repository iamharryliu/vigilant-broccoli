import { PERSONAL_CALENDARS } from '../lib/calendars.consts';
import { buildGoogleCalendarUrl } from '../lib/calendar-links';
import { CalendarTabs } from './components/CalendarTabs';
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
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-8 text-gray-900 dark:text-gray-100">
      <CalendarTabs personalCalendars={personalCalendars} />
    </main>
  </I18nProvider>
);

export default App;
