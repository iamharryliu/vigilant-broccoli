import { ENVIRONMENT } from '../environments/environment';
import { PUBLIC_EVENT_CALENDARS_PATH } from './calendars.consts';
import { CalendarLink } from './calendars.types';

export const fetchPublicEventCalendars = async (
  signal: AbortSignal,
): Promise<CalendarLink[]> => {
  const response = await fetch(
    `${ENVIRONMENT.API_URL}${PUBLIC_EVENT_CALENDARS_PATH}`,
    { signal, cache: 'no-store' },
  );
  if (!response.ok) {
    throw new Error(`Event calendars request failed: ${response.status}`);
  }
  const { calendars } = (await response.json()) as {
    calendars: CalendarLink[];
  };
  if (!Array.isArray(calendars)) {
    throw new Error('Event calendars response is malformed');
  }
  return calendars;
};
