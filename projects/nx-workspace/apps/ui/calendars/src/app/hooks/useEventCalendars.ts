import { useEffect, useMemo, useState } from 'react';
import {
  EmbedEventCalendar,
  readHiddenCalendarIds,
  writeHiddenCalendarIds,
} from '@vigilant-broccoli/personal-common-js';
import { getGoogleCalendarId } from '../../lib/calendar-links';
import {
  CALENDAR_SECTION_STATE,
  HIDDEN_EVENT_CALENDARS_STORAGE_KEY,
} from '../../lib/calendars.consts';
import { fetchPublicEventCalendars } from '../../lib/event-calendars.api';
import { CalendarLink, CalendarSectionState } from '../../lib/calendars.types';

// Owned above the tabs so the list and the embed share one fetch and one
// hidden set.
export const useEventCalendars = () => {
  const [state, setState] = useState<CalendarSectionState>(
    CALENDAR_SECTION_STATE.LOADING,
  );
  const [calendars, setCalendars] = useState<CalendarLink[]>([]);
  const [hiddenIds, setHiddenIds] = useState<ReadonlySet<string>>(
    () => new Set(readHiddenCalendarIds(HIDDEN_EVENT_CALENDARS_STORAGE_KEY)),
  );

  const toggleHidden = (id: string) => {
    const next = new Set(hiddenIds);
    if (!next.delete(id)) next.add(id);
    setHiddenIds(next);
    writeHiddenCalendarIds(HIDDEN_EVENT_CALENDARS_STORAGE_KEY, next);
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchPublicEventCalendars(controller.signal)
      .then(loaded => {
        setCalendars(loaded);
        setState(CALENDAR_SECTION_STATE.READY);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setState(CALENDAR_SECTION_STATE.ERROR);
        }
      });
    return () => controller.abort();
  }, []);

  const embedCalendars = useMemo(
    () =>
      calendars.flatMap((calendar): EmbedEventCalendar[] => {
        const googleCalendarId = getGoogleCalendarId(calendar.url);
        return googleCalendarId
          ? [{ hiddenKey: calendar.id, googleCalendarId }]
          : [];
      }),
    [calendars],
  );

  return { state, calendars, embedCalendars, hiddenIds, toggleHidden };
};
