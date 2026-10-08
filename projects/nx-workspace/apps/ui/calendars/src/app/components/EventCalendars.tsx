import { useEffect, useState } from 'react';
import { CALENDAR_SECTION_STATE } from '../../lib/calendars.consts';
import { fetchPublicEventCalendars } from '../../lib/event-calendars.api';
import { CalendarLink, CalendarSectionState } from '../../lib/calendars.types';
import { CalendarSection } from './CalendarSection';
import { EVENT_HEADING_ID } from './section-ids';

export const EventCalendars = () => {
  const [state, setState] = useState<CalendarSectionState>(
    CALENDAR_SECTION_STATE.LOADING,
  );
  const [calendars, setCalendars] = useState<CalendarLink[]>([]);

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

  return (
    <CalendarSection
      headingKey="SECTION.EVENT"
      headingId={EVENT_HEADING_ID}
      state={state}
      calendars={calendars}
    />
  );
};
