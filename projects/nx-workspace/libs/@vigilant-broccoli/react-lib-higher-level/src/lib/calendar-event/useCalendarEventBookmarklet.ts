'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CALENDAR_EVENT_BOOKMARKLET,
  isCalendarEventBookmarkletMessage,
} from '@vigilant-broccoli/common-js';
import { composeCalendarEventText } from './calendar-event-bookmarklet.utils';

// Receives a page posted by the calendar-event bookmarklet on the home page.
// Only the tab the bookmarklet opened (`window.opener`) is trusted, so a
// foreign page cannot prefill the dialog. `onReceive` should open the dialog;
// pass the returned `prefill` to it and call `clearPrefill` when it closes.
export const useCalendarEventBookmarklet = (onReceive: () => void) => {
  const [prefill, setPrefill] = useState<string>();
  const onReceiveRef = useRef(onReceive);
  onReceiveRef.current = onReceive;

  useEffect(() => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has(CALENDAR_EVENT_BOOKMARKLET.TARGET_PARAM)) return;
    url.searchParams.delete(CALENDAR_EVENT_BOOKMARKLET.TARGET_PARAM);
    window.history.replaceState(null, '', url);
  }, []);

  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (
        !window.opener ||
        event.source !== window.opener ||
        !isCalendarEventBookmarkletMessage(event.data)
      )
        return;
      (event.source as Window).postMessage(
        CALENDAR_EVENT_BOOKMARKLET.ACK,
        event.origin,
      );
      setPrefill(composeCalendarEventText(event.data));
      onReceiveRef.current();
    };
    window.addEventListener('message', receive);
    return () => window.removeEventListener('message', receive);
  }, []);

  const clearPrefill = useCallback(() => setPrefill(undefined), []);

  return { prefill, clearPrefill };
};
