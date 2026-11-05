'use client';

import { useEffect, useRef } from 'react';
import { Text } from '@vigilant-broccoli/react-lib';
import { CALENDAR_EVENT_BOOKMARKLET } from '@vigilant-broccoli/common-js';
import { buildCalendarEventBookmarklet } from '@vigilant-broccoli/react-lib-higher-level';

// The managed-calendar twin of the Create calendar event dialog's bookmarklet:
// that one imports events once, this one tracks the page as a calendar source.
export const ManagedCalendarBookmarkletLink = () => {
  const linkRef = useRef<HTMLAnchorElement>(null);

  // React refuses `javascript:` hrefs, so the link is set on the DOM node.
  useEffect(() => {
    linkRef.current?.setAttribute(
      'href',
      buildCalendarEventBookmarklet(
        window.location.origin,
        CALENDAR_EVENT_BOOKMARKLET.INTENT.SOURCE,
      ),
    );
  }, []);

  return (
    <Text size="1" color="gray">
      <a
        ref={linkRef}
        onClick={event => event.preventDefault()}
        className="underline"
      >
        Add to calendar bookmarklet
      </a>{' '}
      — drag it to your bookmarks bar. On a page with events, it adds the page
      to an event calendar (or creates one) so the calendar keeps syncing from
      it. The Create calendar event bookmarklet imports events once instead.
    </Text>
  );
};
