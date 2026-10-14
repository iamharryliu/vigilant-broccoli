import { useEffect, useState } from 'react';
import {
  readHiddenCalendarIds,
  writeHiddenCalendarIds,
} from '@vigilant-broccoli/personal-common-js';
import {
  CALENDAR_SECTION_STATE,
  HIDDEN_EVENT_CALENDARS_STORAGE_KEY,
} from '../../lib/calendars.consts';
import { fetchPublicEventCalendars } from '../../lib/event-calendars.api';
import { CalendarLink, CalendarSectionState } from '../../lib/calendars.types';
import { CalendarList } from './CalendarList';

export const EventCalendars = () => {
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

  return (
    <CalendarList
      state={state}
      calendars={calendars}
      hiddenIds={hiddenIds}
      onToggleHidden={toggleHidden}
    />
  );
};
