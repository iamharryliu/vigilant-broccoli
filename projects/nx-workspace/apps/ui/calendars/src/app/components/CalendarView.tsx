import { useEffect, useMemo, useState } from 'react';
import { isMobileUserAgent } from '@vigilant-broccoli/common-browser';
import {
  buildEventCalendarEmbedUrl,
  EmbedEventCalendar,
  PUBLIC_BASE_CALENDAR_CONFIG,
} from '@harry/personal';
import { CALENDAR_VIEW_MODE } from '../../lib/calendars.consts';
import { CalendarViewMode } from '../../lib/calendars.types';
import { useTranslation } from '../i18n';

// Mobile browsers get AGENDA: the authenticated custom agenda is not
// available on this public site, so Google's own agenda view stands in.
const useEmbedMode = () => {
  const [mode, setMode] = useState<CalendarViewMode>(CALENDAR_VIEW_MODE.MONTH);
  useEffect(() => {
    if (isMobileUserAgent(navigator.userAgent)) {
      setMode(CALENDAR_VIEW_MODE.AGENDA);
    }
  }, []);
  return mode;
};

export const CalendarView = ({
  eventCalendars,
  hiddenIds,
}: {
  eventCalendars: EmbedEventCalendar[];
  hiddenIds: ReadonlySet<string>;
}) => {
  const { t } = useTranslation();
  const mode = useEmbedMode();

  const src = useMemo(
    () =>
      buildEventCalendarEmbedUrl({
        mode,
        baseConfig: PUBLIC_BASE_CALENDAR_CONFIG,
        eventCalendars,
        hiddenKeys: hiddenIds,
      }),
    [mode, eventCalendars, hiddenIds],
  );

  return (
    <div className="h-[70vh] min-h-[480px] w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
      <iframe
        src={src}
        title={t('STATUS.EMBED_TITLE')}
        className="h-full w-full dark:invert dark:hue-rotate-180"
      />
    </div>
  );
};
