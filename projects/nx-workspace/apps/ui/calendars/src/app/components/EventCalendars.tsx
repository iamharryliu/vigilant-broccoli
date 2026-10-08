import {
  CALENDAR_SECTION_STATE,
  LOAD_STATUS,
} from '../../lib/calendars.consts';
import { loadPublicEventCalendars } from '../../lib/event-calendars';
import { CalendarSection } from './CalendarSection';
import { EVENT_HEADING_ID } from './section-ids';

export const EventCalendars = async () => {
  const result = await loadPublicEventCalendars();

  return result.status === LOAD_STATUS.OK ? (
    <CalendarSection
      headingKey="SECTION.EVENT"
      headingId={EVENT_HEADING_ID}
      calendars={result.calendars}
    />
  ) : (
    <CalendarSection
      headingKey="SECTION.EVENT"
      headingId={EVENT_HEADING_ID}
      state={CALENDAR_SECTION_STATE.ERROR}
    />
  );
};
