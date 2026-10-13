import { useCallback, useMemo, useSyncExternalStore } from 'react';

// Per-browser, like the selected calendar tab. Stores the hidden ids rather
// than the shown ones so a newly created event calendar shows up by default.
const STORAGE_KEY_HIDDEN = 'calendar-view-hidden-event-calendars';
// `storage` only fires in other tabs, so same-tab subscribers need their own event.
const CHANGE_EVENT = 'calendar-view-event-calendars-change';
const EMPTY_SNAPSHOT = '[]';

const readSnapshot = () => {
  try {
    return localStorage.getItem(STORAGE_KEY_HIDDEN) ?? EMPTY_SNAPSHOT;
  } catch {
    return EMPTY_SNAPSHOT;
  }
};

const subscribe = (onChange: () => void) => {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
};

const parseHiddenIds = (snapshot: string): string[] => {
  try {
    const parsed = JSON.parse(snapshot);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const useCalendarViewEventCalendars = () => {
  const snapshot = useSyncExternalStore(
    subscribe,
    readSnapshot,
    () => EMPTY_SNAPSHOT,
  );
  const hiddenIds = useMemo(() => parseHiddenIds(snapshot), [snapshot]);

  const setShown = useCallback((id: string, shown: boolean) => {
    const others = parseHiddenIds(readSnapshot()).filter(
      hiddenId => hiddenId !== id,
    );
    try {
      localStorage.setItem(
        STORAGE_KEY_HIDDEN,
        JSON.stringify(shown ? others : [...others, id]),
      );
    } catch {
      return;
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  return { hiddenIds, setShown };
};
