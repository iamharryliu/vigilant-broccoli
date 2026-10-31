'use client';

import { useEffect, useRef } from 'react';
import { buildCalendarEventBookmarklet } from './calendar-event-bookmarklet.utils';
import { useCalendarEventTranslation } from './i18n';

export const CalendarEventBookmarkletLink = () => {
  const { t } = useCalendarEventTranslation();
  const linkRef = useRef<HTMLAnchorElement>(null);

  // React refuses `javascript:` hrefs, so the link is set on the DOM node.
  useEffect(() => {
    linkRef.current?.setAttribute(
      'href',
      buildCalendarEventBookmarklet(window.location.origin),
    );
  }, []);

  return (
    <p className="text-xs text-gray-500 dark:text-gray-400">
      <a
        ref={linkRef}
        onClick={event => event.preventDefault()}
        className="underline"
      >
        {t('BOOKMARKLET')}
      </a>{' '}
      {t('BOOKMARKLET_HELP')}
    </p>
  );
};
