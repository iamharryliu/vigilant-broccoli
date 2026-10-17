import { CalendarSectionState, CalendarLink } from '../../lib/calendars.types';
import { CalendarList } from './CalendarList';

export const EventCalendars = ({
  state,
  calendars,
  hiddenIds,
  onToggleHidden,
}: {
  state: CalendarSectionState;
  calendars: CalendarLink[];
  hiddenIds: ReadonlySet<string>;
  onToggleHidden: (id: string) => void;
}) => (
  <CalendarList
    state={state}
    calendars={calendars}
    hiddenIds={hiddenIds}
    onToggleHidden={onToggleHidden}
  />
);
