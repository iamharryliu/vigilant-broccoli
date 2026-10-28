import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { readHiddenCalendarIds, writeHiddenCalendarIds } from '@harry/personal';

// Per-browser, like the selected calendar tab. Stores the hidden ids rather
// than the shown ones so a newly created event calendar shows up by default.
const STORAGE_KEY_HIDDEN = 'calendar-view-hidden-event-calendars';
// `storage` only fires in other tabs, so same-tab subscribers need their own event.
const CHANGE_EVENT = 'calendar-view-event-calendars-change';
const EMPTY_SNAPSHOT = '[]';

// useSyncExternalStore needs a referentially stable snapshot, so compare serialized ids.
const readSnapshot = () =>
  JSON.stringify(readHiddenCalendarIds(STORAGE_KEY_HIDDEN));

const subscribe = (onChange: () => void) => {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
};

export const useCalendarViewEventCalendars = () => {
  const snapshot = useSyncExternalStore(
    subscribe,
    readSnapshot,
    () => EMPTY_SNAPSHOT,
  );
  const hiddenIds = useMemo(() => JSON.parse(snapshot) as string[], [snapshot]);

  const setShown = useCallback((id: string, shown: boolean) => {
    const others = readHiddenCalendarIds(STORAGE_KEY_HIDDEN).filter(
      hiddenId => hiddenId !== id,
    );
    writeHiddenCalendarIds(
      STORAGE_KEY_HIDDEN,
      shown ? others : [...others, id],
    );
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  return { hiddenIds, setShown };
};
