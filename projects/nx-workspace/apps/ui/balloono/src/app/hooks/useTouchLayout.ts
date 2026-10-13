import { useSyncExternalStore } from 'react';

// Narrow screens count too: some touch browsers (and device emulators) still
// report a fine pointer, which would leave a phone with no way to move.
const TOUCH_LAYOUT_QUERY = '(pointer: coarse), (max-width: 767px)';
const CHANGE_EVENT = 'change';

const subscribe = (onChange: () => void) => {
  const media = window.matchMedia(TOUCH_LAYOUT_QUERY);
  media.addEventListener(CHANGE_EVENT, onChange);
  return () => media.removeEventListener(CHANGE_EVENT, onChange);
};

const isTouchLayout = () => window.matchMedia(TOUCH_LAYOUT_QUERY).matches;

export const useTouchLayout = () =>
  useSyncExternalStore(subscribe, isTouchLayout, () => false);
